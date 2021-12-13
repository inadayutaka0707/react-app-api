import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Button, Container, Image, Row } from 'react-bootstrap'

function App() {
  const [text, setText] = useState('')
  const [clicked, setClicked] = useState(false)
  const [jpText, setJpText] = useState('')
  const [image, setImage] = useState('')
  const [kanaText, setKanaText] = useState('')
  const [speechType, setSpeechType] = useState('ja-JP-Wavenet-D')
  const isFirstRender = useRef(false)
  let beforeText = ''

  useEffect(() => {
    // このeffectは初回レンダー時のみ呼ばれるeffect
    isFirstRender.current = true
  }, [])

  const onClickHandler = () => {
    setClicked(!clicked)
  }

  const changeSelect = (e) => {
    setSpeechType(e)
  }

  useEffect(() => {
    if (isFirstRender.current) {
      // 初回レンダー判定
      isFirstRender.current = true // もう初回レンダーじゃないよ代入
    } else {
      axios.get('api/json.php').then((res) => {
        const response = res.data[0].meigen
        setJpText(response)
      })
    }
  }, [clicked])

  // useEffect(() => {
  //   if (isFirstRender.current) {
  //     // 初回レンダー判定
  //     isFirstRender.current = true // もう初回レンダーじゃないよ代入
  //   } else {
  //     const data = {
  //       text: text.slip.advice,
  //       source: 'en',
  //       target: 'ja',
  //     }
  //     axios
  //       .get(
  //         `https://script.google.com/macros/s/${process.env.REACT_APP_URI_TRANSLATE}?text=${data.text}&source=${data.source}&target=${data.target}`
  //       )
  //       .then((res) => {
  //         const response = res.data
  //         setJpText(response)
  //       })
  //   }
  // }, [text])

  useEffect(() => {
    if (isFirstRender.current) {
      // 初回レンダー判定
      isFirstRender.current = true // もう初回レンダーじゃないよ代入
    } else {
      if (speechType === 'en-US-Wavenet-D') {
        const options = {
          method: 'post',
          url: 'https://labs.goo.ne.jp/api/hiragana',
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            app_id: process.env.REACT_APP_GOO_API_KEY,
            sentence: jpText,
            output_type: 'hiragana',
          },
        }
        axios(options).then((res) => {
          try {
            setKanaText(res.data.converted)
          } catch (e) {
            console.log(e)
          }
        })
      } else {
        setKanaText(jpText)
      }
    }
  }, [jpText])

  useEffect(() => {
    if (isFirstRender.current) {
      // 初回レンダー判定
      isFirstRender.current = false // もう初回レンダーじゃないよ代入
    } else {
      const apikey = process.env.REACT_APP_TEXTTOSPEECH_API_KEY
      const url =
        'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + apikey
      const data = {
        input: {
          text: kanaText,
        },
        voice: {
          languageCode: 'ja-JP',
          name: speechType,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speaking_rate: '0.0',
          pitch: '-7.00',
          volumeGainDb: '1.0',
        },
      }
      axios.post(url, data).then((res) => {
        try {
          var blobUrl = base64ToBlobUrl(res.data.audioContent)
          var audio = new Audio()
          audio.src = blobUrl
          const img_elements = document.getElementById('stevenImage')
          const min = Math.ceil(1000)
          const max = Math.floor(1100)
          const num = Math.floor(Math.random() * (max - min + 1) + min)
          setImage(`https://www.stevensegallery.com/1000/${num}`)
          // 画像読み込み完了したときの処理
          img_elements.addEventListener('load', (e) => {
            if (kanaText !== beforeText) {
              console.log(audio)
              audio.play()
            }
            beforeText = kanaText
          })
        } catch (e) {
          console.log(e)
        }
      })
    }
  }, [kanaText])

  function base64ToBlobUrl(base64) {
    var bin = atob(base64.replace(/^.*,/, ''))
    var buffer = new Uint8Array(bin.length)
    for (var i = 0; i < bin.length; i++) {
      buffer[i] = bin.charCodeAt(i)
    }
    return window.URL.createObjectURL(
      new Blob([buffer.buffer], { type: 'audio/wav' })
    )
  }

  return (
    <div className='appAll'>
      <Container>
        <Row className='justify-content-md-center'>
          <h1>Steven Segalle 名言</h1>
          <div className='mx-auto text-center'>
            <Image
              id='stevenImage'
              src={image}
              className='md-auto Steven-Segalle-image'
            ></Image>

            <h4>{jpText}</h4>
          </div>
          <div className='xs-3 text-center api-button'>
            <select
              name='speechType'
              onChange={(e) => changeSelect(e.target.value)}
            >
              <option
                value='ja-JP-Wavenet-D'
                key='ja-JP-Wavenet-D'
                defaultValue
              >
                流暢に話す
              </option>
              <option value='en-US-Wavenet-D' key='en-US-Wavenet-D'>
                片言で話す
              </option>
            </select>
          </div>
          <div className='xs-3 text-center api-button'>
            <Button variant='primary' onClick={onClickHandler}>
              api
            </Button>
          </div>
          <div className='text-center goo-api-image'>
            <a href='http://www.goo.ne.jp/'>
              <img
                src='//u.xgoo.jp/img/sgoo.png'
                alt='supported by goo'
                title='supported by goo'
              />
            </a>
          </div>
        </Row>
      </Container>
    </div>
  )
}

export default App
