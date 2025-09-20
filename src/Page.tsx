import { useState } from "react";
import type { ModalResult, ModalState, FormData} from "./types";
import Modal from "./Modal";

const Page = () => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false });

  const openFormModal = (): Promise<ModalResult> => {
    return new Promise((resolve) => {
      setModalState({ isOpen: true, resolve });
    });
  };

  const handleCloseModal = () => {
    if (modalState.resolve) {
      modalState.resolve(null);
    }
    setModalState({ isOpen: false });
  };

  const handleFormSubmit = (data: FormData) => {
    console.log('제출된 데이터:', data);
    if (modalState.resolve) {
      modalState.resolve(data);
    }
    setModalState({ isOpen: false });
  };

  const handleOpenModal = async () => {
    try {
      const result = await openFormModal();
      if (result) {
        // 제출 완료 시 FormData 반환
        alert(`제출 완료!\n이름: ${result.name}\n이메일: ${result.email}`);
      } else {
        // 취소/닫기 시 null 반환
        console.log('모달이 취소되었습니다.');
      }
    } catch (error) {
      console.error('모달 오류:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            접근성 친화적 모달폼
          </h1>

          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            모달 열기
          </button>
        </div>

        <Modal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          onSubmit={handleFormSubmit}
        />
      </div>
    </div>
  );
};

export default Page;
