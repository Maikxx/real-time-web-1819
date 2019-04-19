# Real-Time Web

[🚀 Live demo 🚀](https://rtw-3.herokuapp.com/)

## Table of Contents

1. [Concept](#Concept)
    1. [Application flow](#Application-flow)
    2. [Bonus features](#Bonus-features)
2. [API](#API)
3. [Data life cycle](#Data-life-cycle)
4. [Issues](#Issues)
5. [Sources](#Sources)
6. [License](#License)


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

### Bonus features

If I somehow have time to spare, I want to take up these points:

* I want to make it possible for users to select a party privacy of _closed_, so that users can invite other people to their group.
* I want to make it possible for users to click through to a page where they can follow the currency in a graph in real-time.

## API

The API that I am going to use for this project is [CryptoCompare](https://www.cryptocompare.com/). This is due to their seamingly easy API and pretty good limits.

### Limits

* The API only allows calls to the CryptoCompare server with a maximum of 300 crypto currencies to watch.
* Calls / month: 150,000
* Calls / day: 50,000
* Calls / hour: 25,000
* Calls / minute: 2,500
* Calls / second: 50

This API does not contain a websocket connection, unfortunately, but I found the APIs that do exist with a socket connection, to be very boring. The ones that I have found pretty much only include the large social platforms, like Facebook and Twitter. I do not like to use social media, which also made me hesitant to use these APIs. Then when I wanted to try to use the real-time Instagram API, it appeared to be offlined by Facebook in 2018.

I think that I can make something work with this API by polling a few times a second to simulate fully real-time data.

### Authorization

The API uses a single private key to enforce the limits that are explained above.
In the [dotenv](./env.example) file the key is used as follows: `CRYPTO_COMPARE_KEY='YOUR_KEY'`.

### Endpoints

* [Get all crypto currencies](https://min-api.cryptocompare.com/data/all/coinlist). This endpoint gives back an object of data with the crypto currency as a key, with the data it contains in an object in that key. From this endpoint I only use the FullName, Symbol and SortOrder. I store these (transformed) in the PostgreSQL database. This connection only happens when the `process.env.RUN_SEEDERS` is set to `'true'`.
* [Get live updates for all crypto currencies](https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH&tsyms=EUR). This endpoint gives back an object with crypto currencies as keys, with an object containing the valuta of choice (this application will only use euro, because I am from Europe). This connection is being polled every second (more or less) and then stored in the `crypto_currencies` table in the database. The current value is being added to the `current_value` column.

## Data life cycle

### Version 1

![Data life cycle 1](./docs/data-flow-1.jpg)

### Database exploded view

* **session** (created by express-session)
    * sid: `string`
    * sess: `json`
    * expire: `Date`
* **users**
    * _id: `number`
    * email: `string`
    * username: `string`
    * password: `string` (Hashed)
    * created_at: `Date`
* **crypto_currencies**
    * _id: `number`
    * name: `string`
    * value_history: `number` - Used to store the previous value of a specific currency in euros to compare with the current_value.
    * current_value: `number` - Used to store the current live value of a specific currency in euros.
    * sort_order: `number` - Used to determine if the crypto currency is in the top 50 most popular.
    * symbol: `string`
    * created_at: `Date`
* **group_participants**
    * _id: `number`
    * user_id: `number`
    * group_id: `number`
    * bet: `string` - The current predicted value by a user (HIGH/LOW).
    * effort: `number` - The amount a user has betted in euros.
    * hypothetical_gain: `number` - The amount of money the user would have earned or lost, if they were to use euros to bet.
    * score: `number` - Current amount of times the user has betted right on the course of the currency.
    * created_at: `Date`
* **groups**
    _id: `number`
    name: `string`
    crypto_currency: `number`
    created_at: `date`

## Issues

* [ ] Add feedback for real-time updates (**MEDIUM PRIO**) **MEDIUM**.
* [ ] Add input validation and error feedback (**MEDIUM PRIO**) **MEDIUM**.
* [ ] Improve styling (**LOW PRIO**) **MEDIUM**. (For Joost 🐵).
* [ ] Render client-side data without innerHTML (**VERY LOW PRIO**) **MINOR**.
* [ ] Refactor database queries to be more concise (use nested joins) (**VERY LOW PRIO**) **MEDIUM**.
* [X] Get all the available cryptocurrencies from the API to list on the create a group page (_/groups/create_).
* [X] Implement client-side rendering of the join groups page (_/groups/join_).
* [X] Implement group creation (_/groups/create_).
* [X] Implement joining groups (_/groups/join_).
* [X] Implement login and signup (_/login_ & _/signup_).
* [X] Implement score incrementation.
* [X] Implement sockets on (_/groups/join_ & _/groups/detail_).
* [X] Render a groups detail view (_/groups/detail_) correctly and implement editing you current row.
* [X] Render all groups server-side in which the current user is present (_/groups/list_).

## Sources

* CryptoBettings authentication model is heavily inspired by [this](https://github.com/timtamimi/node.js-passport.js-template) example.

## License

This repository is licensed as [MIT](LICENSE) by [Maikel van Veen](https://github.com/maikxx).