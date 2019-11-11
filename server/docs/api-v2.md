<a name="top"></a>
# Studio Backend API v2.0.0

The Fuse Studio V2 REST API for accessing the data and the services of the Fuse network in a simple way. You can use this API to query and interact with the objects of the Fuse network such as: Communities, Tokens, Bridges and Entities. Learn more on https://github.com/fuseio/fuse-studio.

- [Login](#Login)
	- [Request a verification code](#Request-a-verification-code)
	- [Verify user phone number](#Verify-user-phone-number)
	

# <a name='Login'></a> Login

## <a name='Request-a-verification-code'></a> Request a verification code
[Back to top](#top)

<p>Request a verification code to user's phone number</p>

```
POST /login/request
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| phoneNumber | `String` | <p>User phone number</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| response | `String` | <p>status - ok</p> |
## <a name='Verify-user-phone-number'></a> Verify user phone number
[Back to top](#top)

<p>Verify user phone number by SMS verification code</p>

```
POST /login/verify
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| phoneNumber | `String` | <p>User phone number</p> |
| code | `String` | <p>SMS code recieved to user phone number</p> |


### Success 200
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| token | `String` | <p>JWT token</p> |
