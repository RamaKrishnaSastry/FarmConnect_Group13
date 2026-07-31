import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/tour.css';

const GAP = 16;
const EDGE_PAD = 12;
const MAX_RETRIES = 6;

const getRect = (selector) => {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (!rect.width && !rect.height) return null;
  return rect;
};

export const FeatureGuide = ({ open, steps = [], onClose }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [spot, setSpot] = useState(null);
  const [pos, setPos] = useState(null);
  const [placement, setPlacement] = useState('center');
  const [closing, setClosing] = useState(false);

  const step = steps[index] || {};

  const positionCard = useCallback((targetRect) => {
    const el = cardRef.current;
    const w = el ? el.offsetWidth : 340;
    const h = el ? el.offsetHeight : 220;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!targetRect) {
      setSpot(null);
      setPlacement('center');
      setPos({ top: Math.max(EDGE_PAD, (vh - h) / 2), left: Math.max(EDGE_PAD, (vw - w) / 2) });
      return;
    }

    let chosen;
    const rightSpace = vw - targetRect.right;
    const leftSpace = targetRect.left;
    const bottomSpace = vh - targetRect.bottom;
    const topSpace = targetRect.top;
    if (step.placement) chosen = step.placement;
    else if (rightSpace >= w + GAP && targetRect.height < vh * 0.75) chosen = 'right';
    else if (leftSpace >= w + GAP && targetRect.height < vh * 0.75) chosen = 'left';
    else if (bottomSpace >= h + GAP) chosen = 'bottom';
    else if (topSpace >= h + GAP) chosen = 'top';
    else chosen = 'center';

    let top = 0;
    let left = 0;
    switch (chosen) {
      case 'right':
        left = targetRect.right + GAP;
        top = targetRect.top + targetRect.height / 2 - h / 2;
        break;
      case 'left':
        left = targetRect.left - w - GAP;
        top = targetRect.top + targetRect.height / 2 - h / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + GAP;
        left = targetRect.left + targetRect.width / 2 - w / 2;
        break;
      case 'top':
        top = targetRect.top - h - GAP;
        left = targetRect.left + targetRect.width / 2 - w / 2;
        break;
      default:
        top = Math.max(EDGE_PAD, (vh - h) / 2);
        left = Math.max(EDGE_PAD, (vw - w) / 2);
    }

    top = Math.min(Math.max(top, EDGE_PAD), vh - h - EDGE_PAD);
    left = Math.min(Math.max(left, EDGE_PAD), vw - w - EDGE_PAD);

    setPlacement(chosen);
    setPos({ top, left });
  }, [step.placement]);

  const locateStep = useCallback(() => {
    const retry = (tries) => {
      const el = document.querySelector(step.target);
      if (!el) {
        if (tries < MAX_RETRIES) {
          setTimeout(() => retry(tries + 1), 300);
          return;
        }
        positionCard(null);
        return;
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const rect = getRect(step.target);
        if (!rect) {
          positionCard(null);
          return;
        }
        const pad = step.pad || 8;
        setSpot({
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        });
        positionCard(rect);
      }, 380);
    };
    retry(0);
  }, [positionCard, step.target, step.pad]);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setClosing(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (step.path) {
      navigate(step.path, step.tab ? { state: { tab: step.tab } } : undefined);
    }
    const timer = setTimeout(locateStep, step.path ? 500 : 120);
    return () => clearTimeout(timer);
  }, [open, index]);

  useLayoutEffect(() => {
    if (!open) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = getRect(step.target);
    positionCard(rect);
  }, [open, index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') handleSkip();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index]);

  if (!open || steps.length === 0) return null;

  const goNext = () => {
    if (index < steps.length - 1) setIndex((i) => i + 1);
    else handleFinish();
  };

  const goBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const closeWith = (done) => {
    setClosing(true);
    setTimeout(() => onClose(done), 220);
  };

  const handleFinish = () => closeWith(true);
  const handleSkip = () => closeWith(true);

  const isLast = index === steps.length - 1;
  const isFirst = index === 0;
  const progress = steps.length ? ((index + 1) / steps.length) * 100 : 0;

  const arrowStyle = (() => {
    if (!spot || placement === 'center') return { display: 'none' };
    const size = 14;
    const common = { position: 'absolute', width: size, height: size, background: '#fff' };
    switch (placement) {
      case 'right':
        return { ...common, left: -size / 2, top: 'calc(50% - 7px)' };
      case 'left':
        return { ...common, right: -size / 2, top: 'calc(50% - 7px)' };
      case 'bottom':
        return { ...common, top: -size / 2, left: 'calc(50% - 7px)' };
      case 'top':
        return { ...common, bottom: -size / 2, left: 'calc(50% - 7px)' };
      default:
        return { display: 'none' };
    }
  })();

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-label={step.title}>
      {spot && (
        <div
          className="tour-spotlight"
          style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
        />
      )}

      <div
        key={index}
        ref={cardRef}
        className={`tour-card ${closing ? 'tour-card-out' : ''}`}
        style={pos ? { top: pos.top, left: pos.left } : undefined}
      >
        <div className="tour-progress">
          <div className="tour-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-2xl">
              {step.icon || '🌾'}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                Step {index + 1} of {steps.length}
              </p>
              <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-gray-600">{step.body}</p>

          {step.tip && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              💡 {step.tip}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between gap-2">
            <div className="tour-dots">
              {steps.map((_, i) => (
                <span key={i} className={`tour-dot ${i === index ? 'active' : ''}`} />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={goBack}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={goNext}
                className="rounded-lg bg-green-700 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-green-800"
              >
                {isLast ? 'Finish ✓' : 'Next →'}
              </button>
            </div>
          </div>

          <div className="mt-3 text-right">
            <button
              onClick={handleSkip}
              className="text-xs font-medium text-gray-400 transition hover:text-gray-600"
            >
              Skip tour
            </button>
          </div>
        </div>

        <div className="tour-tip-arrow" style={arrowStyle} />
      </div>
    </div>
  );
};
