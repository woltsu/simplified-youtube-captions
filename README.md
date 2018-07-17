# simplified-youtube-captions  
A simple to use API that returns nicely formatted YouTube video captions with timestamps. With the target parameter the results can be filtered so it only returns the captions that include the given target word/phrase. Currently it only works in english.  
API endpoint: https://simplified-youtube-captions.herokuapp.com/api/v1/captions?id=VIDEO_ID&target=TARGET_STRING 

#### TODO:  
1. Change of language  
2. Guide to index page
3. Target parameter to optional  

#### Example:
https://simplified-youtube-captions.herokuapp.com/api/v1/captions?id=iigDXgdKkuI&target=shrimp  
Part of response:
```json
[
  {
    "timestamp": "0:03:25.520",
    "captions": [
      "And squeeze them so that shrimp do not shrink during frying",
      "and press the shrimp firmly onto your plate so that they do not curl up during the frying.",
      "and press them so the shrimp doesnât curl while deep-frying.",
      "and press so that the shrimp does not roll while it is being fried.",
      "and press them to prevent the shrimp from curling during overpressure.",
      "and squeeze them to avoid what bends during frying.",
      "then press-press let the shrimp guns rolled when fried.",
      "and press so that the shrimp does not roll up while frying.",
      "And press them so that the shrimp will not curl when we deep-fried it",
      "Stretch out so as not to be rounded.",
      "And when you splash, please press so that it does not bend.",
      "and press it so that the shrimp does not curl during frying.",
      "and then squeeze them so they do not curl up as you fry them.",
      "and press them so that the shrimp does not shrink during frying.",
      "and tighten them so that the shrimp does not curl while frying it.",
      "and makes pressure for the shrimp not to curl while frying.",
      "~ and press the muscles so the shrimp will not shrink during the frying.",
      "... and push the shrimp so that it does not curl during the deep-frying process.",
      "and press them so that the shrimp does not cure during frying.",
      "And press it to not curl the fry.",
      "and press on so that the shrimp does not twist when it is red.",
      "and press down so that the shrimp does not curl when fry.",
      "Then press it so that the shrimp wonât roll up when fried.",
      "Then press it so that the shrimp won't roll up when it is fried."
    ]
  }
]
```
