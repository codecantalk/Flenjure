import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel"
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onCancel}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#111] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl pointer-events-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full">
                  <AlertTriangle size={24} strokeWidth={1.5} />
                </div>
                <button
                  onClick={onCancel}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <h3 className="text-xl font-serif text-stone-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-8 leading-relaxed">
                {message}
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onCancel(); // Close modal immediately upon confirmation
                  }}
                  className="px-5 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
