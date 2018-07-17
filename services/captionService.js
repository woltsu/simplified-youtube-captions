// Imports
const axios = require('axios')
const { google } = require('googleapis')

// Local variables
const CAPTION_ID_URL = 'https://www.googleapis.com/youtube/v3/captions?part=id'
const CAPTION_TEXT_URL = 'https://www.googleapis.com/youtube/v3/captions/'
let token = null

// Authenticate into google services
const authenticate = async () => {
  const auth = await google.auth.getClient({
    scopes: [
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtubepartner',
    ]
  })
  accessToken = await auth.getAccessToken()
  token = accessToken.token
}

// Fetch captions using proper APIs
const getCaptions = async (videoId) => {
  await authenticate()
  // Contains list of different possible captions - one timestamp can contain multiple
  // captions
  const captionsResponse = await axios.get(`${CAPTION_ID_URL}&videoId=${videoId}&key=${process.env.API_KEY}`)

  // For each possible caption, fetch that caption
  const captionIds = captionsResponse.data.items.map((caption) => caption.id)
  let captions = ''
  for (let i = 0; i < captionIds.length; i++) {
    const id = captionIds[i]
    // Returns ostream, therefore we need the responseType to be arraybuffer
    const options = {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'arraybuffer'
    }

    // Fetch caption. Contains multiple timestamps and captions in a single string
    const caption = await axios.get(`${CAPTION_TEXT_URL}${id}?&tlang=en&key=${process.env.API_KEY}`, options)
    const captionAsString = String.fromCharCode.apply(null, new Uint16Array(caption.data))
    captions += captionAsString
  }
  const clusteredCaptions = {}
  
  // Cluster captions so that there won't be duplicates of same timestamp
  captions.split('\n\n').forEach((caption) => {
    const splittedCaption = caption.split('\n')
    if (!splittedCaption[1]) {
      splittedCaption[1] = ''
    }
    const timestamp = splittedCaption[0].split(',')[0]
    if (!clusteredCaptions[timestamp]) {
      clusteredCaptions[timestamp] = []
    }

    clusteredCaptions[timestamp].push(splittedCaption[1].trim())
  })
  const result = []

  // Format result into a nice JSON format
  Object.keys(clusteredCaptions).forEach((timestamp) => {
    result.push({ timestamp, captions: clusteredCaptions[timestamp] })
  })
  
  return result
}

module.exports = { getCaptions }
