import React, { useEffect, useRef } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface ScrollAnimationWrapperProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  customDelay?: number;
  threshold?: number;
  viewportOnce?: boolean;
}

/**
 * کامپوننت اسکرول انیمیشن
 * این کامپوننت المان‌های فرزند را با انیمیشن fade-in در زمان اسکرول نمایش می‌دهد
 */
export const ScrollAnimationWrapper: React.FC<ScrollAnimationWrapperProps> = ({
  children,
  className = "",
  variants,
  customDelay = 0,
  threshold = 0.1,
  viewportOnce = true,
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: viewportOnce,
    threshold: threshold,
  });

  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1.0],
        delay: customDelay,
      },
    },
  };

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants || defaultVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * کامپوننت اسکرول انیمیشن با استگر
 * این کامپوننت المان‌های فرزند را با فاصله زمانی مشخص شده انیمیشن می‌دهد
 */
export const StaggerAnimationWrapper: React.FC<ScrollAnimationWrapperProps & { staggerDelay?: number }> = ({
  children,
  className = "",
  customDelay = 0,
  staggerDelay = 0.1,
  threshold = 0.1,
  viewportOnce = true,
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: viewportOnce,
    threshold: threshold,
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: customDelay,
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0],
      },
    },
  };

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  // کپی‌برداری از فرزندان و اضافه کردن variants به آن‌ها
  const childrenWithVariants = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement, {
        variants: itemVariants,
      });
    }
    return child;
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className={className}
    >
      {childrenWithVariants}
    </motion.div>
  );
};

/**
 * کامپوننت انیمیشن با قابلیت تعیین جهت
 * این کامپوننت امکان انیمیشن از چهار جهت مختلف را فراهم می‌کند
 */
export const DirectionalAnimationWrapper: React.FC<
  ScrollAnimationWrapperProps & { direction: "up" | "down" | "left" | "right" }
> = ({ children, className = "", direction, customDelay = 0, threshold = 0.1, viewportOnce = true }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: viewportOnce,
    threshold: threshold,
  });

  // تعیین پارامترهای انیمیشن براساس جهت
  const getDirectionalVariants = (): Variants => {
    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, y: 40 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1.0],
              delay: customDelay,
            },
          },
        };
      case "down":
        return {
          hidden: { opacity: 0, y: -40 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1.0],
              delay: customDelay,
            },
          },
        };
      case "left":
        return {
          hidden: { opacity: 0, x: 40 },
          visible: {
            opacity: 1,
            x: 0,
            transition: {
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1.0],
              delay: customDelay,
            },
          },
        };
      case "right":
        return {
          hidden: { opacity: 0, x: -40 },
          visible: {
            opacity: 1,
            x: 0,
            transition: {
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1.0],
              delay: customDelay,
            },
          },
        };
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1.0],
              delay: customDelay,
            },
          },
        };
    }
  };

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={getDirectionalVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
};