import { Fragment } from 'react';
import { Link } from 'wouter';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoSvg from '@/assets/logo.svg';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { label: string; href: string }[];
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
          <Dialog.Panel className="fixed inset-y-0 left-0 right-0 w-full max-w-md mr-auto glass-effect shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <Link href="/" onClick={onClose}>
                <img src={logoSvg} alt="Xraynama" className="h-8" />
              </Link>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="px-4 py-6">
              <nav className="space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-lg font-medium text-foreground hover:bg-muted transition duration-200"
                    onClick={onClose}
                  >
                    {item.label}
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
