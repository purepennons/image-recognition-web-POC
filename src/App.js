import React, { Component } from 'react'
import dataURLtoBlob from 'blueimp-canvas-to-blob'
import shortid from 'shortid'

import 'normalize.css'

import video from './video.mp4'

const fetch = window.fetch
const host_url = 'http://localhost:8888/upload'

const uploadImages = async (images) => {
    let formData = new FormData()
    const filename = shortid.generate() + '.png'
    images.map(image_blob => formData.append(filename, image_blob, filename))

    const res = await fetch(host_url, {
        method: 'POST',
        body: formData
    })

    const filenames = await res.text()
    
    return filenames
}

class App extends Component {
    constructor(props) {
        super(props)

        this.timeIntervalFn =  null
        this.state = {
            timeInterval: 2000,
            img_src: '',
        }
    }

    componentDidMount() {
        
    }

    onVideoCanPlay(e) {
        this.canvas = document.createElement('canvas')
        this.canvas.width = this.video.videoWidth
        this.canvas.height = this.video.videoHeight
    }

    captureImageFromVideo() {
        this.canvas.getContext('2d').drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)

        const dataURL = this.canvas.toDataURL('image/png')
        const blob = dataURLtoBlob(dataURL)

        console.log('image blob', blob)
        
        uploadImages([blob])
            .then(result => console.log(`${result} has been uploaded`))
            .catch(err => console.log(err))

        this.setState({
            img_src: dataURL
        })
    }

    clear() {
        if (this.timeIntervalFn) clearInterval(this.timeIntervalFn)
        this.timeIntervalFn = null
    }
    
    captureAndUpload(e) {
        this.clear()
        this.timeIntervalFn = setInterval(() => this.captureImageFromVideo(), this.state.timeInterval)
    }


    onPause(e) {
        this.clear()
    }

    onClick(e) {
        e.preventDefault()
        e.stopPropagation()
    }

    onEnter(e) {
        e.stopPropagation()

        if (e.keyCode !== 13) return
        
        const input_value = Number(e.target.value)
        if (!Number.isInteger(input_value)) {
            this.setState({timeInterval: 2000})
        } else {
            this.setState({ timeInterval: input_value })
            this.captureAndUpload(e)
        }
    }

    render() {
        return (
            <div>
                <header>
                    <h1>Image Recognition</h1>
                </header>
                <section>
                    <video controls ref={ref => this.video = ref}
                        onCanPlay={e => this.onVideoCanPlay(e)}
                        onPlay={e => this.captureAndUpload(e)}
                        onPause={e => this.onPause(e)}
                    >
                        <source src={video} type="video/mp4"/>
                    </video>
                    <input type="text" placeholder="request time interval"
                        value={this.state.timeInterval}
                        onChange={e => this.setState({ timeInterval: e.target.value })}
                        onKeyDown={e => this.onEnter(e)}
                    />
                    <img src={this.state.img_src} alt="no captured" />
                </section>
                <footer></footer>
            </div>
        )
    }
}

export default App