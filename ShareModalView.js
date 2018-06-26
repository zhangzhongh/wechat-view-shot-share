import React,{Component} from 'react'
import {
    View,
    StyleSheet,
    Modal,
    Text,
    ScrollView,
    Image,
} from 'react-native'
import Button from '../widget/Button'
import {sharePictureToWx} from '../utils/WeChatUtil'
import {show,timeChange} from '../utils/Utils'
import {Width,Height} from '../base/BaseConstants'
import {connect} from 'react-redux'
import {switchInformationShareModal} from '../action/informationActions'
import {getString} from "../base/constants/I18n";
import {foundation_color, noise_bg3_color, noise_text7_color} from "../base/BaseStyle";

class ShareModalView extends Component {

    componentDidMount() {
        this.props.switchInformationShareModal(false)
    }

    render() {

        return (
            <Modal
                animationType = {"fade"}
                transparent = {true}
                visible={this.props.isShowInformationModal}
                onRequestClose={() => {
                    this.props.switchInformationShareModal(false)
                }}>
                {this.props.isShowInformationModal?this._renderModal():<View/>}
            </Modal>
        )
    }

    _renderModal() {
        return (
            <View style={styles.modal_container}>
                <View style={styles.modal_view} ref = "shareModal">
                    <Image
                        style={styles.image_top}
                        source={require('../data/img/share_top.png')}/>
                    <View style={styles.middle_view}>
                        <ScrollView>
                            <Text allowFontScaling={false} style={styles.middle_context}>{this.props.showModalContext.context}</Text>
                            <Text allowFontScaling={false} style={styles.middle_time}>{timeChange(this.props.showModalContext.time)}</Text>
                        </ScrollView>
                    </View>
                    <Image
                        style={styles.image_bottom}
                        source={require('../data/img/share_bottom.png')}/>
                </View>
                {this._renderShareView()}
            </View>
        )
    }

    _renderShareView() {
        return (
            <View style={styles.share_view}>
                <Image
                    style={styles.share_bg}
                    source={require('../data/img/share_bg.png')}/>
                <Button buttonStyle={styles.share_wechat}
                    onPress={()=> this.shareToWeChat(true)}>
                    <Image
                        style={styles.share_icon}
                        source={require('../data/img/wechat.png')}/>
                </Button>
                <Button
                    buttonStyle={styles.share_friend}
                    onPress={()=>this.shareToWeChat(false)}>
                    <Image
                        style={styles.share_icon}
                        source={require('../data/img/wechat_friend.png')}/>
                </Button>
                <Button
                    buttonStyle={styles.share_exit}
                    onPress={()=>{
                        this.props.switchInformationShareModal(false)
                    }}>
                    <Image
                        style={styles.share_exit_icon}
                        source={require('../data/img/share_exit.png')}/>
                </Button>
            </View>
        )
    }

    shareToWeChat(isWeChat) {
        sharePictureToWx(this.refs['shareModal'],isWeChat,this.props.curLanguageIndex)
            .then((data)=>{
                this.props.switchInformationShareModal(false)
                if (data) {
                    show(getString('shareSuccess',this.props.curLanguageIndex))
                } else {
                    show(getString('shareError',this.props.curLanguageIndex))
                }
            })
            .catch((error)=>{
                this.props.switchInformationShareModal(false)
                show(getString('shareError',this.props.curLanguageIndex))
            })
    }

}

const modalWidth = Width() - 60
const modalHeight = Height() - 80

const styles = StyleSheet.create({
    modal_container: {
        width: Width(),
        height: Height(),
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modal_view: {
        width: modalWidth,
        height: modalHeight,
        backgroundColor: noise_bg3_color,
    },
    image_top: {
        width: modalWidth,
        height: modalWidth*577/1080,
        resizeMode: 'contain'
    },
    middle_view: {
        padding: 20,
        flex: 1,
    },
    middle_title: {
        fontSize: 24,
        color: foundation_color,
    },
    middle_context: {
        fontSize: 13,
        color: noise_text7_color,
        lineHeight: 20,
    },
    middle_time: {
        alignSelf: 'flex-end',
        fontSize: 13,
        color: noise_text7_color
    },
    image_bottom: {
        width: modalWidth,
        height: modalWidth*377/1080,
        resizeMode: 'contain'
    },

    share_view: {
        position: 'absolute',
        bottom: 50,
    },
    share_bg: {
        width: 200,
        height: 200*236/492,
        resizeMode: 'contain'
    },
    share_wechat: {
        position: 'absolute',
        top: 3,
        left: 2
    },
    share_friend: {
        position: 'absolute',
        top: 3,
        right: 2
    },
    share_icon: {
        width: 66,
        height: 66,
    },
    share_exit: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: 2 ,
    },
    share_exit_icon: {
        width: 46,
        height: 46,
    }
})

const mapStateToProps = (state) => ({
    isShowInformationModal: state.information.isShowInformationModal,
    showModalContext: state.information.showModalContext,
    curLanguageIndex: state.user.curLanguageIndex
})
const mapDispatchToProps = (dispatch) => ({
    switchInformationShareModal: (isShowShare,showModalContext)=>{
        dispatch(switchInformationShareModal(isShowShare,showModalContext))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(ShareModalView)