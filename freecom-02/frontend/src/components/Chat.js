import React, { Component } from 'react'
import './Chat.css'
import ChatInput from './ChatInput'
import ChatMessages from './ChatMessages'
import Dropzone from 'react-dropzone'
import { graphql, gql, compose } from 'react-apollo'

const createMessage = gql`
  mutation createMessage($text: String!, $conversationId: ID!) {
    createMessage(text: $text, conversationId: $conversationId) {
      id
      text
      createdAt
      agent {
        id
        slackUserName
        imageUrl
      }
      conversation {
        id
      }
    }
  }
`

const allMessages = gql`
  query allMessages($conversationId: ID!) {
    allMessages(filter: {
      conversation: {
        id: $conversationId
      }
    })
    {
      id
      text
      createdAt
      agent {
        id
        slackUserName
        imageUrl
      }
    }
  }
`

class Chat extends Component {
  state = {
    message: '',
  }

  render() {
    if (this.props.allMessagesQuery.loading) {
      return (
        <div className="loading-container">
          <div
            style={{ backgroundColor: this.props.mainColor || 'rgba(0,0,0,.5)' }}
            className="loading"
          />
        </div>
      )
    }

    return (
      <Dropzone
        className="dropzone relative"
        onDrop={this._onFileDrop}
        accept="image/*"
        multiple={false}
        disableClick={true}
      >
        <div className="message-body chat-container">
          <ChatMessages
            messages={this.props.allMessagesQuery.allMessages || []}
            userSpeechBubbleColor={this.props.mainColor}
            profileImageURL={this.props.profileImageURL}
          />
          {this.state.isUploadingImage &&
            <div className="upload-image-indicator">Uploading image ...</div>}
          <ChatInput
            message={this.state.message}
            onTextInput={message => this.setState({ message })}
            onResetText={() => this.setState({ message: '' })}
            onSend={this._onSend}
            onDrop={this._onFileDrop}
          />
        </div>
      </Dropzone>
    )
  }

  _onSend = () => {
    console.debug('Send message: ', this.state.message, this.props.conversationId, this.props.createMessageMutation)
    this.props.createMessageMutation({
      variables: {
        text: this.state.message,
        conversationId: this.props.conversationId,
      }
    })
  }

  _onFileDrop = (acceptedFiles, rejectedFiles) => {}
}

export default compose(
  graphql(allMessages, { name: 'allMessagesQuery' }),
  graphql(createMessage, { name: 'createMessageMutation' }),
)(Chat)
