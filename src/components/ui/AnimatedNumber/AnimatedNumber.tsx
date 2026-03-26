import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface AnimatedNumberProps {
    value: number;
    suffix?: string;
}

/**
 * A reusable component that animates a numeric value with a "count-up" effect.
 * Uses framer-motion for smooth transitions.
 */
const AnimatedNumber = ({ value, suffix = "" }: AnimatedNumberProps) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

    useEffect(() => {
        const controls = animate(count, value, {
            duration: 0.8,
            ease: "easeOut",
        });
        return () => controls.stop();
    }, [value, count]);

    return (
        <span>
            <motion.span>{rounded}</motion.span>
            {suffix && <span> {suffix}</span>}
        </span>
    );
};

export default AnimatedNumber;
