// @ts-nocheck
/**
 * Type definitions for Sallie UI Component Library
 */

import { ReactNode, HTMLAttributes, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactElement } from 'react';

// Base types
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'link';
export type Theme = 'peacock' | 'leopard' | 'mixed' | 'obsidian' | 'celestial' | 'void';
export type Status = 'success' | 'warning' | 'error' | 'info';

// Button Types
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  theme?: Theme;
  size?: Size;
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: Theme;
  size?: Size;
  label: string; // Required for accessibility
  children: ReactNode;
}

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  size?: Size;
  children: ReactNode;
}

// Input Types
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  theme?: Theme;
  size?: Size;
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  isFullWidth?: boolean;
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  theme?: Theme;
  size?: Size;
  label?: string;
  error?: string;
  hint?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  theme?: Theme;
  size?: Size;
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  theme?: Theme;
  size?: Size;
  label?: string;
  description?: string;
  error?: string;
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  theme?: Theme;
  size?: Size;
  label?: string;
  description?: string;
}

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  theme?: Theme;
  size?: Size;
  label?: string;
  description?: string;
}

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  theme?: Theme;
  size?: Size;
  label?: string;
  showValue?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

// Layout Types
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  variant?: 'elevated' | 'outlined' | 'filled';
  isHoverable?: boolean;
  isClickable?: boolean;
  padding?: Size;
  children: ReactNode;
}

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: Size;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  children: ReactNode;
}

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: Size;
  children: ReactNode;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  allowMultiple?: boolean;
  children: ReactNode;
}

// Navigation Types
export interface NavigationProps extends HTMLAttributes<HTMLElement> {
  theme?: Theme;
  orientation?: 'horizontal' | 'vertical';
  items: Array<{
    label: string;
    href?: string;
    icon?: ReactNode;
    isActive?: boolean;
    children?: Array<{ label: string; href: string }>;
  }>;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  theme?: Theme;
  items: Array<{ label: string; href?: string }>;
  separator?: ReactNode;
}

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  theme?: Theme;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

// Feedback Types
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  status: Status;
  title?: string;
  isClosable?: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  status: Status;
  title: string;
  description?: string;
  duration?: number;
  isClosable?: boolean;
  onClose?: () => void;
}

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  value: number;
  max?: number;
  size?: Size;
  showValue?: boolean;
  isIndeterminate?: boolean;
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  size?: Size;
  label?: string;
}

// Data Display Types
export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  size?: Size;
  src?: string;
  alt?: string;
  name?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  isAnimated?: boolean;
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  theme?: Theme;
  variant?: 'solid' | 'subtle' | 'outline';
  size?: Size;
  status?: Status;
  children: ReactNode;
}

export interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  size?: Size;
  isSelected?: boolean;
  isClosable?: boolean;
  onClose?: () => void;
  leftIcon?: ReactNode;
  children: ReactNode;
}

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  theme?: Theme;
  size?: Size;
  isStriped?: boolean;
  isHoverable?: boolean;
  columns: Array<{ key: string; header: string; width?: string }>;
  data: Array<Record<string, unknown>>;
}

export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  content: ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  children: ReactElement;
}

// Overlay Types
export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  content: ReactNode;
  placement?: 'top' | 'right' | 'bottom' | 'left';
  trigger?: 'click' | 'hover';
  children: ReactElement;
}

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  theme?: Theme;
  trigger: ReactNode;
  items: Array<{
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    isDisabled?: boolean;
    isDanger?: boolean;
  }>;
}

export interface MenuProps extends HTMLAttributes<HTMLMenuElement> {
  theme?: Theme;
  items: Array<{
    label: string;
    icon?: ReactNode;
    shortcut?: string;
    onClick?: () => void;
    isDisabled?: boolean;
    isDivider?: boolean;
  }>;
}

// Utility Types
export interface PortalProps {
  children: ReactNode;
  container?: HTMLElement;
}

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export interface FocusTrapProps {
  children: ReactNode;
  isActive?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
}
