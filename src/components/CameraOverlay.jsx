import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * 全屏摄像头预览覆盖层
 * onCapture(file)   — 用户拍照，返回 File 对象
 * onClose()         — 用户取消
 * onFallback()      — 用户选择从相册选图（回退到 file input）
 * t                 — 翻译对象
 */
export default function CameraOverlay({ onCapture, onClose, onFallback, t }) {
  const videoRef = useRef(null);
  const brightnessRef = useRef(null); // 隐藏 canvas，用于亮度采样
  const streamRef = useRef(null);

  const [ready, setReady] = useState(false);       // 视频已就绪
  const [isFlashing, setIsFlashing] = useState(false); // 白色快门闪烁
  const [isShooting, setIsShooting] = useState(false); // 取景框缩放动画
  const [lightWarning, setLightWarning] = useState(false); // 暗光预警

  // ── 启动摄像头 ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        // 权限被拒绝或设备不支持 → 静默回退到文件选择
        if (!cancelled) onFallback();
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onFallback]);

  // ── 亮度检测（每 1.5 秒采样一次） ─────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const video = videoRef.current;
      const canvas = brightnessRef.current;
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) return;

      const W = 80, H = 45;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, W, H);
      const pixels = ctx.getImageData(0, 0, W, H).data;

      let sum = 0;
      const count = pixels.length / 4;
      for (let i = 0; i < pixels.length; i += 4) {
        // 加权亮度（ITU-R BT.601）
        sum += (pixels[i] * 299 + pixels[i + 1] * 587 + pixels[i + 2] * 114) / 1000;
      }
      setLightWarning(sum / count < 55);
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // ── 停止流的公共方法 ──────────────────────────────────────────────────────
  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  // ── 拍照 ──────────────────────────────────────────────────────────────────
  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    // 动画反馈
    setIsFlashing(true);
    setIsShooting(true);
    setTimeout(() => setIsFlashing(false), 220);
    setTimeout(() => setIsShooting(false), 420);

    // 将当前帧绘制到 canvas 并导出为 File
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          stopStream();
          onCapture(new File([blob], 'capture.jpg', { type: 'image/jpeg' }));
        }
      },
      'image/jpeg',
      0.92,
    );
  }, [onCapture, stopStream]);

  const handleClose = useCallback(() => { stopStream(); onClose(); }, [onClose, stopStream]);
  const handleFallback = useCallback(() => { stopStream(); onFallback(); }, [onFallback, stopStream]);

  return (
    <div className="cam-overlay">
      {/* 实时视频流 */}
      <video
        ref={videoRef}
        className="cam-video"
        autoPlay
        playsInline
        muted
        onCanPlay={() => setReady(true)}
      />
      {/* 亮度采样用隐藏 canvas */}
      <canvas ref={brightnessRef} style={{ display: 'none' }} />

      {/* 快门白色闪光 */}
      {isFlashing && <div className="cam-flash" />}

      {/* ── 顶部渐变 + 循环滚动提示 ── */}
      <div className="cam-hint-bar">
        {/* 两份文本实现无缝循环滚动 */}
        <div className="cam-hint-track">
          <span className="cam-hint-text">💡 {t.camHint}</span>
          <span className="cam-hint-text" aria-hidden="true">💡 {t.camHint}</span>
        </div>
      </div>

      {/* 暗光预警条 */}
      {lightWarning && (
        <div className="cam-warning">⚠️ {t.camDarkWarning}</div>
      )}

      {/* ── 取景区：参考框 + 对齐提示 ── */}
      <div className="cam-scene">
        {/* 仅四角边框的参考线框 */}
        <div className={`cam-guide${isShooting ? ' cam-guide-shoot' : ''}`}>
          <span className="cam-corner cam-tl" />
          <span className="cam-corner cam-tr" />
          <span className="cam-corner cam-bl" />
          <span className="cam-corner cam-br" />
        </div>
        {/* 框下方提示文字 */}
        <div className="cam-align-tip">{t.camAlignTip}</div>
      </div>

      {/* ── 底部控制栏 ── */}
      <div className="cam-controls">
        {/* 取消 */}
        <button className="cam-btn-side cam-btn-cancel" onClick={handleClose}>
          {t.cancel}
        </button>

        {/* 快门按钮 */}
        <button
          className="cam-btn-shutter"
          onClick={handleCapture}
          disabled={!ready}
          aria-label="拍照"
        >
          <span className="cam-shutter-inner" />
        </button>

        {/* 相册回退 */}
        <button className="cam-btn-side cam-btn-album" onClick={handleFallback}>
          <span className="cam-album-icon">🖼</span>
          <span className="cam-album-label">{t.camAlbum}</span>
        </button>
      </div>
    </div>
  );
}
