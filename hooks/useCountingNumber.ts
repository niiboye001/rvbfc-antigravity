import { useEffect, useState } from 'react';

export function useCountingNumber(endValue: number, duration: number = 2000, shouldAnimate: boolean = true) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!shouldAnimate) return;

        // If 0, stay 0
        if (endValue === 0) {
            setCount(0);
            return;
        }

        let startTime: number;
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Easing function (easeOutExpo) -> 1 - 2^(-10 * t)
            const easeOut = (x: number): number => {
                return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
            };

            const currentCount = Math.floor(easeOut(percentage) * endValue);

            // Start from 1 as requested, unless value is < 1 (which acts as 0 check fallback, though handled above)
            setCount(Math.max(1, currentCount));

            if (progress < duration) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setCount(endValue);
            }
        };

        // Small initial delay to ensure UI is ready and effect is noticeable
        const timeoutId = setTimeout(() => {
            animationFrameId = requestAnimationFrame(animate);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            cancelAnimationFrame(animationFrameId);
        };
    }, [endValue, duration, shouldAnimate]);

    return count;
}
