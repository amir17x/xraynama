import { Fragment } from 'react';
import { Link } from 'wouter';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  englishLabel: string;
  href: string;
  icon: React.ReactNode;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export function MobileMenu({ isOpen, onClose, navItems }: MobileMenuProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 md:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#00142c]/70 backdrop-blur-md" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="transform transition ease-in-out duration-300"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transform transition ease-in-out duration-300"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <Dialog.Panel className="fixed inset-y-0 left-0 right-0 w-full max-w-md mr-auto bg-[#00142c]/90 backdrop-blur-xl shadow-xl border-l border-[#00BFFF]/20">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#00BFFF]/20">
              <Dialog.Title className="text-xl font-semibold text-white flex items-center">
                <span className="text-[#00BFFF] ml-2">X</span>
                <span>منوی اصلی</span>
              </Dialog.Title>
              <Button variant="ghost" size="icon" className="glassmorphic-icon w-9 h-9 flex items-center justify-center" onClick={onClose}>
                <X className="h-5 w-5 text-[#00BFFF]" />
              </Button>
            </div>
            
            <div className="px-4 py-6">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-3 py-3 rounded-md hover:bg-[#00BFFF]/10 transition-all duration-300 group"
                    onClick={onClose}
                  >
                    <div className="ml-3 text-[#00BFFF] group-hover:text-[#00BFFF] transition-colors duration-300">
                      {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-white">{item.label}</span>
                      <span className="text-xs text-gray-400 group-hover:text-white transition-colors duration-300">
                        {item.englishLabel}
                      </span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
