import { StatusBar } from 'expo-status-bar';
import { useState, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { captureRef } from "react-native-view-shot";
import domtoimage from 'dom-to-image';


import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

import ImageViewer from './components/ImageViewer';
import Button from './components/Button';
import CircleButton from './components/CircleButton';
import IconButton from './components/IconButton';
import EmojiPicker from './components/EmojiPicker';
import EmojiList from './components/EmojiList';
import EmojiSticker from './components/EmojiSticker';

const PlaceHolderImage = require('./assets/images/background-image.png');

export default function App() {
    const [status, requestPermission] = MediaLibrary.usePermissions();
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAppOptions, setShowAppOptions] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pickedEmoji, setPickedEmoji] = useState(null);
    const imageRef = useRef();
    if (status === null) {
        requestPermission();
    }

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
        });
        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri)
            setShowAppOptions(true);
        } else {
            console.log('you did not select an image.');
        }
    };

    const onReset = () => {
        setShowAppOptions(false);
    }

    const onAddSticker = () => {
        setIsModalVisible(true);
    };

    const onModalClose = () => {
        setIsModalVisible(false);
    };

    const onSaveImageAsync = async () => {
        try {
            if (Platform.OS === 'web') {
                const dataUrl = await domtoimage.toPng(imageRef.current, {
                    quality: 1,
                    width: 320,
                    height: 440,
                });
                let link = document.createElement('a');
                link.download = 'image.png';
                link.href = dataUrl
                link.click();
            } else {
                const localUri = await captureRef(imageRef, {
                    height: 440,
                    quality: 1,
                });

                await MediaLibrary.saveToLibraryAsync(localUri);
                if (localUri) {
                    alert('Image saved successfully');
                }
            }
        } catch (error) {
            console.log('Error saving image', error);
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.container}>
                <View style={styles.imageContainer} ref={imageRef} collapsable={false}>
                    <ImageViewer placeholderImageSource={PlaceHolderImage} selectedImage={selectedImage} />
                    {pickedEmoji && <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />}
                </View>
                {
                    showAppOptions ?
                        (<View style={styles.optionContainer}>
                            <View style={styles.optionRow}>
                                <IconButton icon="refresh" label="Reset" onPress={onReset} />
                                <CircleButton onPress={onAddSticker} />
                                <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
                            </View>
                        </View>)
                        :
                        (<View style={styles.footerContainer}>
                            <Button label="Choose a photo" theme="primary" onPress={pickImageAsync} />
                            <Button label="Use this photo" onPress={() => setShowAppOptions(true)} />
                        </View>)
                }
                <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
                    <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
                </EmojiPicker>
                <StatusBar style="light" />
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        flex: 1,
        paddingTop: 50,
    },
    image: {
        width: 320,
        height: 440,
        borderRadius: 18,
    },
    footerContainer: {
        flex: 1 / 3,
        alignItems: 'center',
    },
    optionContainer: {
        position: 'absolute',
        bottom: 80,
    },
    optionRow: {
        alignItems: 'center',
        flexDirection: 'row',
    }
});
