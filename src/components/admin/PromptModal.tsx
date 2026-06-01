import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X } from "lucide-react";
import { useState, useEffect } from "react";

interface PromptModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: "text" | "number";
}

export function PromptModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Save",
  cancelText = "Cancel",
  defaultValue = "",
  placeholder = "",
  type = "text"
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

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
                <div className="p-3 bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 rounded-full">
                  <HelpCircle size={24} strokeWidth={1.5} />
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
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
                {message}
              </p>

              <div className="mb-8">
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-transparent border border-stone-200 dark:border-stone-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-white transition-all text-stone-900 dark:text-white"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onConfirm(value);
                      onCancel();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm(value);
                    onCancel();
                  }}
                  className="px-5 py-2.5 text-sm font-medium bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:text-black dark:hover:bg-stone-200 rounded-lg transition-colors"
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
