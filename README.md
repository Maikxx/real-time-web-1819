# Real-Time Web

[🚀 Live demo 🚀](https://rtw-3.herokuapp.com/)

This app uses real-time technologies, like web sockets to enable a useful user experience.

## Concept and API

The API that I am going to use for this project is [CryptoCompare](https://www.cryptocompare.com/). This is due to their seamingly easy API and pretty good limits.

The limits for this API are as follows:
* Calls / day: 50,000
* Calls / hour: 25,000
* Calls / minute: 2,500
* Calls / second: 50

This API does not contain a websocket connection, unfortunately, but I found the APIs that do exist with a socket connection, to be very boring. The ones that I have found pretty much only include the large social platforms, like Facebook and Twitter. I do not like to use social media, which also made me hesitant to use these APIs. Then when I wanted to try to use the real-time Instagram API, it appeared to be offlined by Facebook in 2018.

I think that I can make something work with this API by polling a few times a second to simulate fully real-time data.

## License

This repository is licensed as [MIT](LICENSE) by [Maikel van Veen](https://github.com/maikxx).