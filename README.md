# IBM Video Streaming Web Player API

[![Build Status](https://travis-ci.com/IBM/video-streaming-web-player-api.svg?branch=master)](https://travis-ci.com/IBM/video-streaming-web-player-api)
![npm](https://img.shields.io/npm/v/ibm-video-streaming-web-player-api)

Enables sites using the [IBM Video Streaming](https://video.ibm.com/) embed iframe to build and adapt on the embed live player.

The Player API provides basic methods to control the live stream or recorded video playback, and enables the user to access essential events of the live stream or the played video.

The Player API requires the [postMessage](https://www.w3.org/TR/webmessaging/) DOM API, it won’t work in browsers that does not support the postMessage API.

## Download

```bash
npm install ibm-video-streaming-web-player-api
```

## Usage

Create an instance of the Embed API by providing the ID of the iframe, or the iframe DOM object itself:

```html
<iframe
    id="iframeId"
    src="//ustream.tv/embed/1524"
    width="640"
    height="480"
    allowfullscreen
    webkitallowfullscreen
></iframe>
```

### global variable

```javascript
const viewer = window.PlayerAPI('iframeId');
```

### es modules

```javascript
import PlayerAPI from 'ibm-video-streaming-web-player-api';

const viewer = PlayerAPI('iframeId'); // id or HTMLIFrameElement reference
```

The IBM Video Streaming Player API provides the following methods:

 * callMethod
 * getProperty
 * addListener
 * removeListener

## URL parameters

The default behaviour of the player can be modified by extending the src URL with any of the following parameters:

| Parameter | Effect | Values | Default |
| ------------- | ----------- | ----------- | ----------- |
| allowfullscreen | Enables full-screen. False value makes the full-screen button inactive. | true/false | true |
| api-target-origin | Origin of the page where player api is included. Use `encodeURIComponent` to URL encode origin. This parameter is only required in case of SSO authentication.                                                                              | URL encoded origin e.g. output of `encodeURIComponent('https://video.ibm.com')`        | N/A     |
| autoplay | Starts video playback automatically. Browser settings are stronger and may override the value of this parameter. | true/false | false |
| controls | When set to false it hides all UI elements. | true/false | true |
| forced-quality | Turns off the automatic quality selection and selects the appropriate quality. Low is the smallest available quality, high is the largest and med is the middlemost choice. | low, med, high | N/A |
| hideCTA | Disables CTA overlays. Use liveCtaUpdate event to build your own. | true/false | false |
| initial-quality | Sets the initial quality for the automatic quality selection. The quality selection logic is still turned on and can switch to another quality after playback is started. | low, med, high | N/A |
| showtitle | Shows title and viewer count information inside the player area. | true/false | true |
| volume | Set volume for playback as a percentage of the max volume. Overrides the default volume (100). | 0-100 | 100 |

## callMethod

Calls a command method of the embed player, passing in any arguments.

Available commands through `callMethod`:

### play

Starts playing the currently loaded channel or video.

##### Example:

```javascript
viewer.callMethod('play');
```


### pause

Pauses the live stream, or the playback of a video.

##### Example:

```javascript
viewer.callMethod('pause');
```


### stop

Pauses the live stream, or stops the video and jumps back to the start.

##### Example:

```javascript
viewer.callMethod('stop');
```


### load

Loads a channel or a video in the player.
Requires two additional arguments:

* `type` - the loaded content type (_channel | video_)
* `id`   - the loaded content id

##### Example:

```javascript
viewer.callMethod('load', 'video', 5903947);
viewer.callMethod('load', 'channel', 1524);
```


### seek

Jumps to given position in played recorded video.

Requires one argument:

* position in seconds

##### Example:

```javascript
viewer.callMethod('seek', 180);
```


### volume
Sets the playback sound volume

Requires one argument:

* volume percent between 0-100

##### Example:

```javascript
viewer.callMethod('volume', 0); // mute
```


### quality

Sets the stream quality, if available.

Requires one argument:

* a `qualityID` key from received quality options in `quality` event

##### Example:

```javascript
viewer.callMethod('quality', 0); // set to highest quality
```

### cc (closed caption)

Displays the selected closed caption if available. You can use the ‘None’ option by using -1 as the argumnet. Otherwise it requires this argument:

Requires one argument:

* an `index` key from the received closed caption object in `cc` event

##### Example:

```javascript
viewer.callMethod('cc', 1); //enables the closed caption with index 1
viewer.callMethod('cc', -1); //disables the closed caption
```

---------------------------------------

## getProperty

Read a property of the embed player.

This method is **asynchronous**, the data will be passed to a callback function, given as argument.

Accessible properties by `getProperty`:


### duration

Get the video duration in seconds.

##### Example:

```javascript
viewer.getProperty('duration', function (duration) {
    // passed value is e.g. 120.345
    ...
});
```


### viewers

Get the current viewer count for the loaded live stream.

##### Example:

```javascript
viewer.getProperty('viewers', function (viewerNumber) {
    ...
});
```

### allTimeTotalViewers

Get the accumulated total viewer number for the loaded channel. Doesn’t return anything in case of videos.

##### Example:

```javascript
viewer.getProperty('allTimeTotalViewers', function (allTimeTotalViewers) {
    ...
});
```


### progress

Get the current progress for recorded video playback, in seconds.

##### Example:

```javascript
viewer.getProperty('progress', function (progress) {
    ...
});
```


### content

Get the loaded content type and id as an array.

##### Example:

```javascript
viewer.getProperty('content', function (content) {
    // content == ['channel', 1524]
    // or
    // content == ['recorded', 123456]
    ...
});
```

### playingContent

Get the actual content type and id as an array. This will return the currently played offair video's id if the loaded content is an offair channel or with the channel id if the channel is live.

##### Example:

```javascript
viewer.callMethod('load', 'channel', 1524);

// ...

viewer.getProperty('playingContent', function (content) {
    // content == ['channel', 1524]
    //  - if it's live, or
    // content == ['recorded', 123456]
    //  - if it's offair and has offair video content, or
    // content == []
    //  - if it's offair and doesn't have offair video content
});
```

### volume

Get the player volume. This will return the actual value of volume in percents.

##### Example:

```javascript
viewer.getProperty('volume', function (volume) {
    // volume == 0 for muted playback
    ...
});
```

---------------------------------------

## addListener &amp; removeListener

The embed player dispatches several events during playback.
This method adds or removes event handlers to these events.

The event handler callback receives two arguments:

* `type` the type of the event
* `data` _optional_ data sent along the event

Available events for `addListener` and `removeListener`:


### live

Called when the currently loaded offline channel becomes live.

##### Example:
```javascript
viewer.addListener('live', callBack);
```


### offline
Called when the currently loaded live channel goes offline.

##### Example:
```javascript
viewer.addListener('offline', callBack);
```


### finished

Called when the currently loaded and played recorded video reaches its end.

##### Example:
```javascript
viewer.addListener('finished', callBack);
```


### playing

Called when the currently loaded content playback is started or stopped

Sends data along the event:

* `playing` (boolean)

##### Example:
```javascript
viewer.addListener('playing', callBack);
```


### size

Called when the stream size is available, or changed _(changes reported only in flash mode)_

Sent data is the size of the calculated embed iframe according to the player width, and the stream aspect ratio. The player bar height is included, if the controls are visible.

Sends data along the event:

* `size` (array) as [`width`, `height`] in pixels

##### Example:
```javascript
viewer.addListener('size', callBack);
```


### quality

Fired when the stream quality options are available.

Receives an array of quality objects, in which are the following keys:

* `id` (number) the id with which the quality method can be called
* `codec` (string)
* `width` (number) width of the quality version in pixels
* `height` (number) height of the quality version in pixels
* `bitrate` (number) actual bitrate value in kbps
* `transcoded` (boolean) is this quality one of the transcoded versions or the original ingested quality
* `label` (object): its `text` key has the text to show to users on control UI, eg.: “480p”
* `selected` (boolean) is this quality set to display


##### Example:
```javascript
viewer.addListener('quality', callBack);
```
```javascript
// example payload
[
    {
        "id": 0,
        "codec": "avc1.4d001f",
        "bitrate": 1406,
        "transcoded": false,
        "width": 1280,
        "height": 720,
        "label": {
            "text": "720p",
            "suffix": " HD",
            "bitrate": " @ 1.4 Mbps"
        },
        "selected": false
    },
]
```


### cc

Fired when there are closed captions available on the stream.

Returns an array containing closed captions as objects.

* `index` (number) unique index of the closed caption
* `label` (string) displayed label of the closed caption
* `language` (string) ISO language code of the closed caption
* `country` (string) ISO code of country
* `active` (boolean) height of the quality version in pixels

##### Example:
```javascript
viewer.addListener('cc', callBack);
```

```javascript
// example payload
[
    {
        "index": 0,
        "label": "Spanish",
        "language": "es",
        "country": "00",
        "active": true
    }
]
```

### content

Called when a the player content changes for some reason.
Same data as received in getProperty('content')

Received arguments: data (array)

##### Example:
```javascript
viewer.addListener('content', callBack);
```

### liveCtaUpdate

Fired when there is a live cta available on the stream.

Returns an object:

* `buttonText` (string) text of the button
* `buttonUrl` (string) URL of CTA
* `description` (string) description of CTA
* `id` (integer) id of CTA
* `imageUrl` (string) URL of the image
* `title` (string) title of CTA

##### Example:
```javascript
viewer.addListener('liveCtaUpdate', callBack);
```

```javascript
// example payload
{
    activate: {
        buttonText: "Click here!"
        buttonUrl: "https://video.ibm.com"
        description: "The Future of Video with Watson",
        id: 123,
        imageUrl: "URL of image",
        title: "IBM Video Streaming"
    }
}
```


[Ustream]:http://ustream.tv/
[postMessage]:http://www.w3.org/TR/webmessaging/
