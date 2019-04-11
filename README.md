# Real-Time Web

[🚀 Live demo 🚀](https://rtw-3.herokuapp.com/)

This app uses real-time technologies, like web sockets to enable a useful user experience.

## Concept

This platform makes it possible for groups of friends to participate in a game of crypto betting.

### Application flow

1. **Login / Sign up**
    1. The user logs in with their email and password.
    2. The user creates a new account with their email, name and password.
2. **Dashboard**
    1. A link to the page where a user can join an existing group from the platform.
    2. A link to the page where a user can view their joined groups. (Only active if they have any active and joined groups).
    3. A link to the page where a user can create a new group.
3. **Join / view joined / create groups**
    1. On the join page users are asked to select a group from the dropdown. Here they see a real-time list of other users that are in that group below, along with the currency that is being bet on. The user should press the join button once chosen a group that they would like to join. When a user joined a group, they are taken to the page that that group can be found on, where the user can place a bet.
    2. On the joined groups page, the user is greeted with a list of groups belonging to that user. When the user clicks on the name of a group, the user is taken to that groups detail page.
    3. When the user choose to create a new group, they are prompted with a window that contains a form. In this form, the group name, group currency and (if I have time, see **bonus** below) the group privacy level. When submitted, they are taken to the detail page of that group.
4. **Group detail page**
    On this page the user sees the currency, the group name and the participants. The participants are shown in a table form, where their name, their current bet and their amount of points is visible.
    On the row with your own name, which is highlighted, your betting field will be an input field with your current bet as default. You can change your bet by simply changing this dropdown.

A wireflow of this will be added **shortly**.

**Bonus**

If I somehow have time to spare, I want to take up these points:

* I want to make it possible for users to select a party privacy of _closed_, so that users can invite other people to their group.
* I want to make it possible for users to click through to a page where they can follow the currency in a graph in real-time.

## API

The API that I am going to use for this project is [CryptoCompare](https://www.cryptocompare.com/). This is due to their seamingly easy API and pretty good limits.

The limits for this API are as follows:
* Calls / day: 50,000
* Calls / hour: 25,000
* Calls / minute: 2,500
* Calls / second: 50

This API does not contain a websocket connection, unfortunately, but I found the APIs that do exist with a socket connection, to be very boring. The ones that I have found pretty much only include the large social platforms, like Facebook and Twitter. I do not like to use social media, which also made me hesitant to use these APIs. Then when I wanted to try to use the real-time Instagram API, it appeared to be offlined by Facebook in 2018.

I think that I can make something work with this API by polling a few times a second to simulate fully real-time data.

## Todo

* Implement client-side rendering of the join groups page.
* Implement joining groups.
* Implemnent login and signup.
* Get all the available cryptocurrencies from the API to list on the create a group page.

## License

This repository is licensed as [MIT](LICENSE) by [Maikel van Veen](https://github.com/maikxx).