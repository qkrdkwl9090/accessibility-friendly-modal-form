import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { FormErrors, ModalProps, FormData } from './types';


const Modal = ({ isOpen, onClose, onSubmit }: ModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const modalTitleId = useId();
  const nameFieldId = useId();
  const emailFieldId = useId();
  const nameErrorId = useId();
  const emailErrorId = useId();

  // prefers-reduced-motion 체크
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 폼 검증
  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return '이름을 입력해주세요.';
        if (value.trim().length < 2) return '이름은 2글자 이상 입력해주세요.';
        break;
      case 'email': {
        if (!value.trim()) return '이메일을 입력해주세요.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return '올바른 이메일 형식을 입력해주세요.';
        break;
      }
    }
    return undefined;
  };

  const validateForm = (data: FormData): FormErrors => {
    const newErrors: FormErrors = {};
    (Object.keys(data) as Array<keyof FormData>).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  };

  // 포커서블 요소 찾기
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors));
  }, []);

  // 모달 상태 관리
  useEffect(() => {
    if (!isOpen) return;

    // 현재 포커스된 요소 저장
    lastFocusedElement.current = document.activeElement as HTMLElement;

    // 배경 스크롤 방지
    document.body.style.overflow = 'hidden';

    // 키보드 이벤트 핸들러
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = getFocusableElements(modalRef.current);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (focusableElements.length === 0) return;

        if (e.shiftKey) {
          // Shift + Tab (역방향) - 첫 번째 요소에서 마지막 요소로
          if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab (정방향) - 마지막 요소에서 첫 번째 요소로
          if (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    // 키보드 이벤트 리스너 추가
    document.addEventListener('keydown', handleKeyDown);

    // 모달이 열릴 때 첫 번째 입력 필드에 포커스
    const focusDelay = prefersReducedMotion ? 0 : 100;
    const focusTimeout = setTimeout(() => {
      firstInputRef.current?.focus();
    }, focusDelay);

    return () => {
      // 키보드 이벤트 리스너 제거
      document.removeEventListener('keydown', handleKeyDown);

      // 배경 스크롤 복원
      document.body.style.overflow = '';

      clearTimeout(focusTimeout);

      // 이전 포커스 복원
      if (lastFocusedElement.current) {
        lastFocusedElement.current.focus();
      }
    };
  }, [isOpen, onClose, prefersReducedMotion, getFocusableElements]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 모든 필드를 터치된 것으로 표시
    setTouched({ name: true, email: true });

    const formErrors = validateForm(formData);
    setErrors(formErrors);

    // 에러가 없으면 Submit
    if (Object.keys(formErrors).length === 0) {
      onSubmit(formData);
      // 폼 초기화
      setFormData({ name: '', email: '' });
      setErrors({});
      setTouched({});
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 필드가 터치되었을 때만 실시간 검증 (입력 중에는 검증하지 않음)
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // 모달 외부 클릭으로 닫기
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-auto shadow-xl"
        role="document"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <h2
          id={modalTitleId}
          className="text-xl font-semibold text-gray-900 mb-6"
        >
          사용자 정보 입력
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor={nameFieldId}
              className="block text-sm font-medium text-gray-700"
            >
              이름 *
            </label>
            <input
              ref={firstInputRef}
              id={nameFieldId}
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                errors.name
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? nameErrorId : undefined}
              required
            />
            {errors.name && (
              <p id={nameErrorId} className="text-sm text-red-600" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor={emailFieldId}
              className="block text-sm font-medium text-gray-700"
            >
              이메일 *
            </label>
            <input
              id={emailFieldId}
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? emailErrorId : undefined}
              required
            />
            {errors.email && (
              <p id={emailErrorId} className="text-sm text-red-600" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              제출
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;