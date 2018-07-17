// Imports
const axios = require('axios')
const { google } = require('googleapis')

// Local variables
const CAPTION_ID_URL = 'https://www.googleapis.com/youtube/v3/captions?part=id'
const CAPTION_TEXT_URL = 'https://www.googleapis.com/youtube/v3/captions/'
let token = null

// Authenticate into google services
const authenticate = async () => {
  let authConfig = {
    scopes: [
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtubepartner',
    ],
  }

  // Check if credentials are stored in an environmental variable.
  // Otherwise google will automatically look for credentials.json
  // file whose location is specified in the environmental variable
  // called 'GOOGLE_APPLICATION_CREDENTIALS'
  let credentials = process.env.GOOGLE_CREDENTIALS
  if (credentials) {
    authConfig['credentials'] = JSON.parse(credentials)
  }
  const auth = await google.auth.getClient({
    ...authConfig
  })
  accessToken = await auth.getAccessToken()

  // Store token as a local variable
  token = accessToken.token
}

// Fetch captions using proper APIs
const getCaptions = async (videoId) => {
  try {
    // Authenticate to google services
    await authenticate()

    // Contains a list of caption id's - one timestamp can have multiple possible
    // captions. API_KEY is stored as an environmental variable
    const captionsResponse = await axios.get(`${CAPTION_ID_URL}&videoId=${videoId}&key=${process.env.API_KEY}`)

    // Fetch all captions using their ids
    const captionIds = captionsResponse.data.items.map((caption) => caption.id)
    let captions = ''
    for (let i = 0; i < captionIds.length; i++) {
      const id = captionIds[i]
      const options = {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'arraybuffer'
      }

      // Returns the fetched caption as ostream
      const caption = await axios.get(`${CAPTION_TEXT_URL}${id}?&tlang=en&key=${process.env.API_KEY}`, options)
      const captionAsString = String.fromCharCode.apply(null, new Uint16Array(caption.data))

      // Store the fetched caption. Caption is of format
      // 'TIMESTAMP\nVALUE' and the timestamp is of format
      // 'hh:mm:ss,hh:mm:ss where the first value is where the
      // caption first appears
      captions += captionAsString
    }
    const clusteredCaptions = {}
    
    // Cluster captions so that there won't be duplicates of same timestamp.
    // First we seperate all the captions from each other.
    captions.split('\n\n').forEach((caption) => {
      // Seperate timestamp and the caption value
      const splittedCaption = caption.split('\n')

      // Check that the caption isn't undefined or null
      if (!splittedCaption[1]) {
        splittedCaption[1] = ''
      }

      // Only take the start time of the timestamp
      const timestamp = splittedCaption[0].split(',')[0]
      if (!clusteredCaptions[timestamp]) {
        clusteredCaptions[timestamp] = []
      }

      // 'Connect' the caption to the specific timestamp
      clusteredCaptions[timestamp].push(splittedCaption[1].trim())
    })
    const result = []

    // Format result into a nice JSON of format { timestamp: x, captions: [x, y, z] }
    Object.keys(clusteredCaptions).forEach((timestamp) => {
      result.push({ timestamp, captions: clusteredCaptions[timestamp] })
    })
    
    return result
  } catch (e) {
    // Handle possible errors
    if (!e.response || !e.response.status) {
      return { error: 'Error fetching captions', status: 422 }
    }

    switch (e.response.status) {
      case 404:
        return { error: 'Video not found.', status: 404 }
      case 403:
        return { error: 'Captions for this video are unavailable for 3rd party use.', status: 403 }
      default:
        return { error: 'Error fetching captions', status: 422 }
    }
  }
}

module.exports = { getCaptions }
