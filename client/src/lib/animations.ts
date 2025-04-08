/**
 * انیمیشن‌های سفارشی برای استفاده در کل پروژه
 * این کلاس‌ها می‌توانند در هر کامپوننت استفاده شوند
 */

// تنظیمات انیمیشن‌های مختلف
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5, 
      ease: "easeInOut" 
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.2, 
      ease: "easeOut" 
    }
  }
};

export const slideUpVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      duration: 0.4
    }
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: { 
      duration: 0.2, 
      ease: "easeOut" 
    }
  }
};

export const slideDownVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      duration: 0.4
    }
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: { 
      duration: 0.2, 
      ease: "easeOut" 
    }
  }
};

export const slideRightVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      duration: 0.4
    }
  },
  exit: { 
    x: -20, 
    opacity: 0,
    transition: { 
      duration: 0.2, 
      ease: "easeOut" 
    }
  }
};

export const slideLeftVariants = {
  hidden: { x: 20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30,
      duration: 0.4
    }
  },
  exit: { 
    x: 20, 
    opacity: 0,
    transition: { 
      duration: 0.2, 
      ease: "easeOut" 
    }
  }
};

export const scaleVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300,
      damping: 20,
      duration: 0.4
    }
  },
  exit: { 
    scale: 0.9, 
    opacity: 0,
    transition: { 
      duration: 0.2, 
      ease: "easeOut" 
    }
  }
};

// انیمیشن برای کارت‌های محتوا
export const contentCardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: (custom: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: custom * 0.1,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0], // cubic-bezier
    },
  }),
  hover: {
    y: -5,
    scale: 1.02,
    boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    boxShadow: "0 5px 10px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.15,
    },
  },
};

// انیمیشن برای منوها و دراپ‌داون‌ها
export const menuVariants = {
  hidden: { opacity: 0, y: -5, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.2, 
      ease: [0.4, 0.0, 0.2, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    y: -5, 
    scale: 0.95,
    transition: { 
      duration: 0.15, 
      ease: [0.4, 0.0, 0.2, 1] 
    }
  }
};

// انیمیشن برای دکمه‌ها
export const buttonVariants = {
  hover: { 
    scale: 1.05,
    transition: { 
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: { 
    scale: 0.95,
    transition: { 
      duration: 0.1,
      ease: "easeOut"
    }
  }
};

// انیمیشن برای بخش‌های بزرگ صفحه
export const sectionVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.5
    }
  }
};

// انیمیشن‌های مختلف برای المان‌های موجود در دسته بندی‌ها
export const staggerChildrenVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

// انیمیشن برای لودینگ
export const loadingVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// انیمیشن چرخش برای آیکون‌ها
export const spinVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// انیمیشن موج برای آیتم‌های تعاملی
export const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// انیمیشن ضربان برای نمایش اطلاعیه‌های مهم
export const heartbeatVariants = {
  animate: {
    scale: [1, 1.1, 1, 1.1, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatDelay: 1
    }
  }
};

// انیمیشن برای هدر در هنگام اسکرول
export const headerScrollVariants = {
  top: { 
    backgroundColor: "rgba(10, 10, 10, 0.2)",
    backdropFilter: "blur(5px)",
    boxShadow: "none",
    height: "80px",
    transition: { duration: 0.3 }
  },
  scrolled: { 
    backgroundColor: "rgba(10, 10, 10, 0.8)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    height: "70px",
    transition: { duration: 0.3 }
  }
};

// انیمیشن برای اسلایدر و کاروسل‌ها
export const sliderVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }
  })
};

// انیمیشن برای جلوه گلس مورفیزم
export const glassMorphismVariants = {
  initial: {
    backdropFilter: "blur(5px)",
    backgroundColor: "rgba(10, 10, 10, 0.2)"
  },
  hover: {
    backdropFilter: "blur(10px)",
    backgroundColor: "rgba(10, 10, 10, 0.3)",
    transition: { duration: 0.3 }
  }
};

// انیمیشن برای اشاره‌گر سفارشی
export const cursorVariants = {
  default: {
    width: "20px",
    height: "20px",
    x: "-10px",
    y: "-10px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 28
    }
  },
  hover: {
    width: "40px",
    height: "40px",
    x: "-20px",
    y: "-20px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 28
    }
  }
};