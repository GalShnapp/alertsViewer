import clsx from 'clsx';
import { isFunction } from 'lodash-es';
import { useContext } from 'react';
import type { ModalOverlayProps } from 'react-aria-components';
import { Text, Modal, ModalOverlay, OverlayTriggerStateContext, Button, Heading } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

export function Drawer({
    children,
    className,
    isDismissable = true,
    isKeyboardDismissDisabled = true,
    onOpenChange,
    ...props
}: ModalOverlayProps) {
    return (
        <ModalOverlay
            className={({ isEntering, isExiting }) =>
                clsx(
                    'fixed inset-0 z-50 flex h-[var(--visual-viewport-height)] w-screen items-center justify-center',
                    isEntering && 'animate-in fade-in duration-300',
                    isExiting && 'animate-out fade-out duration-200',
                )
            }
            isDismissable={isDismissable}
            isKeyboardDismissDisabled={isKeyboardDismissDisabled}
            onOpenChange={(isOpen) => {
                if (!isFunction(onOpenChange)) return;

                setTimeout(() => {
                    onOpenChange(isOpen);
                }, 200);
            }}
            style={{ backgroundColor: 'rgba(62, 58, 55, .4)' }}
            {...props}>
            <Modal
                className={(bag) =>
                    twMerge(
                        'fixed inset-0 z-50 flex flex-col bg-white md:inset-x-auto md:inset-y-0 md:right-0 md:w-[40rem]',
                        bag.isEntering && 'animate-in slide-in-from-right duration-300 ease-out',
                        bag.isExiting && 'animate-out slide-out-to-right duration-200 ease-in',
                        typeof className === 'function' ? className(bag) : className,
                    )
                }>
                {children}
            </Modal>
        </ModalOverlay>
    );
}

function Header({
    title,
    subTitle,
    children,
}: {
    children?: React.ReactNode;
    title?: string;
    subTitle?: string;
}) {
    const context = useContext(OverlayTriggerStateContext);
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b bg-white p-6 pb-8 pt-7 md:gap-0 md:p-4">
            <div className="flex flex-1 flex-row-reverse items-center gap-4 overflow-hidden md:flex-row">
                <div className="flex flex-1 flex-col overflow-hidden text-grey-800">
                    <Heading className="truncate" level={2} slot="title">
                        {title}
                    </Heading>
                    {subTitle && (
                        <Text className="text-gray-400 text-xs" slot="subTitle">
                            {subTitle}
                        </Text>
                    )}
                </div>
                <Button
                    aria-label="close"
                    className="pt-0.5 focus:outline-none"
                    onPress={context.close}
                >
                    X
                </Button>
            </div>
            {children && <div className="flex items-center">{children}</div>}
        </header>
    );
}

function Footer({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <footer
            className={clsx(
                'border-grey-300 sticky bottom-0 z-[10] border-t bg-white p-4 pt-3',
                className,
            )}>
            {children}
        </footer>
    );
}

Drawer.Header = Header;
Drawer.Footer = Footer;
