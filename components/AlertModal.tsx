import { AlertTriangle, CheckCircle2, Info } from 'lucide-react-native';
import React from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface AlertModalProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    buttonText?: string;
    type?: 'success' | 'error' | 'info';
    wrapInModal?: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
    visible,
    title,
    message,
    onClose,
    buttonText = 'Okay',
    type = 'info',
    wrapInModal = true
}) => {
    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <View className="bg-green-500 w-10 h-10 rounded-full items-center justify-center shadow-lg shadow-green-500/30">
                        <CheckCircle2 size={24} color="#ffffff" strokeWidth={3} />
                    </View>
                );
            case 'error':
                return (
                    <View className="bg-red-500 w-10 h-10 rounded-full items-center justify-center shadow-lg shadow-red-500/30">
                        <AlertTriangle size={24} color="#ffffff" strokeWidth={3} />
                    </View>
                );
            case 'info':
            default:
                return (
                    <View className="bg-blue-500 w-10 h-10 rounded-full items-center justify-center shadow-lg shadow-blue-500/30">
                        <Info size={24} color="#ffffff" strokeWidth={3} />
                    </View>
                );
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success': return 'bg-green-50';
            case 'error': return 'bg-red-50';
            case 'info': return 'bg-blue-50';
            default: return 'bg-slate-50';
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'success': return 'bg-green-600 shadow-green-500/25';
            case 'error': return 'bg-red-500 shadow-red-500/25';
            case 'info': return 'bg-blue-600 shadow-blue-500/25';
            default: return 'bg-slate-800';
        }
    };

    const Content = (
        <View className={`flex-1 justify-center items-center p-6 backdrop-blur-sm z-50 ${wrapInModal ? 'bg-slate-900/60' : 'absolute inset-0 bg-slate-900/60'}`}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="absolute inset-0" />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback>
                <View className="bg-white w-full max-w-[340px] rounded-[32px] p-8 shadow-2xl items-center border border-white/50">
                    <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 shadow-sm ${getBgColor()}`}>
                        {getIcon()}
                    </View>

                    <Text className="text-2xl font-black text-slate-900 text-center mb-3 tracking-tight">
                        {title}
                    </Text>

                    <Text className="text-slate-500 text-center mb-8 font-medium leading-6 text-[15px] px-2">
                        {message}
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={onClose}
                        className={`w-full py-4 rounded-2xl items-center shadow-lg transform active:scale-[0.98] ${getButtonColor()}`}
                    >
                        <Text className="text-white font-black text-lg tracking-wide uppercase text-sm">
                            {buttonText}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );

    if (!visible) return null;

    if (wrapInModal) {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                statusBarTranslucent
                onRequestClose={onClose}
            >
                {Content}
            </Modal>
        );
    }

    return Content;
};
