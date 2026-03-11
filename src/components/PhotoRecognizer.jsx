import { useRef, useState } from 'react';
import { recognizeTilesFast, recognizeTiles } from '../logic/tileRecognizer';
import CameraOverlay from './CameraOverlay';

// 是否支持 getUserMedia（需要安全上下文 HTTPS / localhost）
const canUseCamera =
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia &&
  window.isSecureContext;

const AUTH_ERRORS = new Set(['INVALID_PASSCODE', 'INVALID_USER_API_KEY', 'API_KEY_NOT_SET']);

// 前端超时（略大于 vercel.json maxDuration，让服务端自然结束）
const FAST_TIMEOUT_MS   = 18_000; // 18 s — Gemini/Haiku 通常 2-6 s
const REFINE_TIMEOUT_MS = 55_000; // 55 s — GPT-4o detail:high 通常 10-30 s

/**
 * 找出精准结果与极速结果的差异位置（按原始识别顺序索引）
 * 返回 newTiles 中发生变化的索引，用于闪烁高亮
 */
function diffTileArrays(oldTiles, newTiles) {
  const changed = [];
  const maxLen = Math.max(oldTiles.length, newTiles.length);
  for (let i = 0; i < maxLen; i++) {
    if (i >= oldTiles.length || i >= newTiles.length || oldTiles[i] !== newTiles[i]) {
      if (i < newTiles.length) changed.push(i);
    }
  }
  return changed;
}

export default function PhotoRecognizer({
  onTilesRecognized,
  onTilesRefined,   // (newTiles, changedIndices) — 精准结果回调
  disabled, t,
  passcode, userApiKey, requirePasscode, onPasscodeInvalid, onApiKeyInvalid,
}) {
  const inputRef = useRef(null);
  const [loading, setLoading]       = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError]           = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  const isAuthorized = !!(passcode || userApiKey);

  // ── 鉴权错误统一处理 ─────────────────────────────────────────────────────
  const handleAuthError = (err) => {
    if (err.message === 'INVALID_PASSCODE')     onPasscodeInvalid?.();
    else if (err.message === 'INVALID_USER_API_KEY') onApiKeyInvalid?.();
    else if (err.message === 'API_KEY_NOT_SET') setError(t.photoNoApiKey);
  };

  // ── 核心逻辑：并行双请求，状态接力 ──────────────────────────────────────
  const processFile = async (file) => {
    setError(null);
    setLoading(true);
    setIsRefining(false);

    // ── 同时发起两路独立请求（不互相等待）───────────────────────────────────
    const fastPromise   = recognizeTilesFast(file, passcode, userApiKey);
    const refinePromise = recognizeTiles(file, passcode, userApiKey);

    // 附加 catch 防止 unhandled rejection；错误细节在阶段二统一处理并打印
    refinePromise.catch(err => console.warn('[refine early-catch]', err.message));

    // ══════════════════════════════════════════════════════════════
    // 阶段一：等待极速结果（Gemini Flash / Haiku）
    //   → 成功则立即渲染牌面并进入"精校中"状态
    //   → 失败则保持 loading，由精准结果兜底
    // ══════════════════════════════════════════════════════════════
    let fastTiles = null;

    try {
      fastTiles = await Promise.race([
        fastPromise,
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error('FAST_TIMEOUT')), FAST_TIMEOUT_MS)
        ),
      ]);
    } catch (err) {
      if (AUTH_ERRORS.has(err.message)) {
        // 鉴权失败：立即中断，不等精准结果
        handleAuthError(err);
        setLoading(false);
        return;
      }
      // 极速模型超时或解析失败：fall-through，由精准模型兜底
    }

    if (fastTiles?.length > 0) {
      // 极速结果可用：立即渲染 + 进入精校等待
      onTilesRecognized(fastTiles);
      setLoading(false);
      setIsRefining(true);
    }
    // 若极速失败：loading 保持 true，精准结果作为首次渲染来源

    // ══════════════════════════════════════════════════════════════
    // 阶段二：独立等待精准结果（GPT-4o / Sonnet）
    //   → 若有极速结果：比对差异，有差异则覆盖并触发绿色闪烁
    //   → 若无极速结果：精准结果作为主结果直接渲染
    //   → 超时或失败：静默丢弃，不影响已渲染的极速结果
    // ══════════════════════════════════════════════════════════════
    try {
      const refineTiles = await Promise.race([
        refinePromise,
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error('REFINE_TIMEOUT')), REFINE_TIMEOUT_MS)
        ),
      ]);

      if (fastTiles?.length > 0) {
        // 精校模式：比对两次结果，有差异则覆盖并高亮
        const changed = diffTileArrays(fastTiles, refineTiles);
        if (changed.length > 0 || fastTiles.length !== refineTiles.length) {
          onTilesRefined?.(refineTiles, changed);
        }
        // 完全一致则静默（无需更新）

      } else {
        // 极速未成功：精准结果为唯一来源
        if (!refineTiles?.length) {
          setError(t.photoNoTiles);
        } else {
          onTilesRecognized(refineTiles);
        }
        setLoading(false);
      }

    } catch (err) {
      // 明确打印精准通道的所有错误，方便在控制台和 Vercel Logs 中排查
      console.error('[analyze-refine] error —', err.message, '| hasFastResult:', !!fastTiles?.length);
      if (err.message === 'REFINE_TIMEOUT') {
        // 超时：若已有极速结果则保留，否则报错
        if (!fastTiles?.length) {
          setError(t.photoNoTiles);
          setLoading(false);
        }
      } else if (AUTH_ERRORS.has(err.message)) {
        console.error('[analyze-refine] auth error:', err.message);
        if (!fastTiles?.length) {
          handleAuthError(err);
          setLoading(false);
        }
      } else {
        // 其他错误：已有极速结果则降级保留，无则上报
        if (!fastTiles?.length) {
          setError(
            err.message === 'PARSE_ERROR' ? t.photoParseError : t.photoError(err.message)
          );
          setLoading(false);
        }
      }
    } finally {
      setIsRefining(false);
    }
  };

  // ── 按钮点击 ──────────────────────────────────────────────────────────────
  const handleButtonClick = () => {
    if (!isAuthorized) { requirePasscode(null); return; }
    if (canUseCamera) {
      setShowCamera(true);
    } else {
      inputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    await processFile(file);
  };

  const handleCameraCapture = async (file) => {
    setShowCamera(false);
    await processFile(file);
  };

  const handleCameraClose    = () => setShowCamera(false);
  const handleCameraFallback = () => {
    setShowCamera(false);
    setTimeout(() => inputRef.current?.click(), 50);
  };

  return (
    <div className="photo-recognizer">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={false}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <button
        className={`btn-photo ${loading ? 'btn-photo-loading' : ''} ${!isAuthorized ? 'btn-photo-locked' : ''}`}
        onClick={handleButtonClick}
        disabled={disabled || loading}
      >
        {loading ? (
          <><span className="spinner" /><span>{t.photoLoading}</span></>
        ) : (
          <><span className="photo-icon">{!isAuthorized ? '🔒' : '📷'}</span><span>{t.photoButton}</span></>
        )}
      </button>

      {/* AI 精准校对进行中提示 */}
      {isRefining && (
        <div className="refining-badge">
          <span className="refining-spinner" />
          <span>{t.photoRefining}</span>
        </div>
      )}

      {error && <p className="photo-error">{error}</p>}

      {showCamera && (
        <CameraOverlay
          onCapture={handleCameraCapture}
          onClose={handleCameraClose}
          onFallback={handleCameraFallback}
          t={t}
        />
      )}
    </div>
  );
}
