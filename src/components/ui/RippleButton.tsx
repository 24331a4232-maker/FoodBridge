import { motion, type HTMLMotionProps } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

type RippleButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  fullWidth?: boolean;
};

export function RippleButton({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  onClick,
  ...props
}: RippleButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    ghost: 'btn-ghost',
  }[variant];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (button) {
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      const rect = button.getBoundingClientRect();
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('ripple');
      circle.style.position = 'absolute';
      circle.style.borderRadius = '50%';
      circle.style.background = 'rgba(255,255,255,0.4)';
      circle.style.transform = 'scale(0)';
      circle.style.animation = 'ripple 0.6s linear';
      circle.style.pointerEvents = 'none';
      button.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    }
    onClick?.(e);
  };

  return (
    <motion.button
      ref={buttonRef}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`${variantClass} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}
