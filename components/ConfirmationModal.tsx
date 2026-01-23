import { AlertTriangle, Info } from 'lucide-react-native';
import React from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
    showCancelButton?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    showCancelButton = true
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View className="flex-1 bg-slate-900/40 justify-center items-center p-6 backdrop-blur-sm">
                    <TouchableWithoutFeedback>
                        <View className="bg-white w-full max-w-[340px] rounded-[32px] p-8 shadow-2xl items-center border border-white/50">
                            <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 shadow-sm ${type === 'danger' ? 'bg-red-50' : 'bg-blue-50'}`}>
                                {type === 'danger' ? (
                                    <View className="bg-red-500 w-10 h-10 rounded-full items-center justify-center shadow-lg shadow-red-500/30">
                                        <AlertTriangle size={20} color="#ffffff" strokeWidth={3} />
                                    </View>
                                ) : (
                                    <View className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center shadow-lg shadow-blue-500/30">
                                        <Info size={20} color="#ffffff" strokeWidth={3} />
                                    </View>
                                )}
                            </View>

                            <Text className="text-2xl font-black text-slate-900 text-center mb-3 tracking-tight">
                                {title}
                            </Text>

                            <Text className="text-slate-500 text-center mb-10 font-medium leading-6 text-[15px] px-2">
                                {message}
                            </Text>

                            <View className="w-full gap-3">
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={onConfirm}
                                    className={`w-full py-4 rounded-2xl items-center shadow-lg transform active:scale-[0.98] ${type === 'danger' ? 'bg-red-500 shadow-red-500/25' : 'bg-blue-600 shadow-blue-500/25'}`}
                                >
                                    <Text className="text-white font-black text-lg tracking-wide uppercase text-sm">
                                        {confirmText}
                                    </Text>
                                </TouchableOpacity>

                                {showCancelButton && (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={onCancel}
                                        className="w-full py-3 items-center"
                                    >
                                        <Text className="text-slate-400 font-bold text-sm tracking-widest uppercase">
                                            {cancelText}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};
