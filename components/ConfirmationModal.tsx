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
                <View className="flex-1 bg-black/60 justify-center items-center p-6">
                    <TouchableWithoutFeedback>
                        <View className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl items-center">
                            <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${type === 'danger' ? 'bg-red-50' : 'bg-blue-50'}`}>
                                {type === 'danger' ? (
                                    <AlertTriangle size={32} color="#ef4444" strokeWidth={2.5} />
                                ) : (
                                    <Info size={32} color="#3b82f6" strokeWidth={2.5} />
                                )}
                            </View>

                            <Text className="text-xl font-black text-slate-900 text-center mb-2">
                                {title}
                            </Text>

                            <Text className="text-slate-500 text-center mb-8 font-medium leading-5">
                                {message}
                            </Text>

                            <View className="w-full gap-3">
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={onConfirm}
                                    className={`w-full py-4 rounded-xl items-center shadow-sm ${type === 'danger' ? 'bg-red-500' : 'bg-blue-500'}`}
                                >
                                    <Text className="text-white font-bold text-lg tracking-wide">
                                        {confirmText}
                                    </Text>
                                </TouchableOpacity>

                                {showCancelButton && (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={onCancel}
                                        className="w-full py-4 rounded-xl items-center bg-slate-100"
                                    >
                                        <Text className="text-slate-600 font-bold text-lg">
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
