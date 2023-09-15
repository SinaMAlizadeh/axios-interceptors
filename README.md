### Repeating Failed Requests After Token Refresh in Axios Interceptors for React.js Apps

In modern web applications, making HTTP requests to APIs is a fundamental part of the development process. Axios, a popular JavaScript library, simplifies the process of making HTTP requests in React.js applications. However, when dealing with secured APIs and token-based authentication, it's essential to handle token expiration gracefully. This article explores how to ensure that all requests made during a token refresh process are automatically repeated with the new access token.

#### Understanding Axios Interceptors

Axios interceptors are middleware that allows you to intercept and transform HTTP requests and responses globally throughout your application. This is especially useful for tasks like adding authentication headers to requests, handling errors, and managing tokens.

```javascript
// Setting up Axios in a React.js project
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://api.example.com',
});

// Add global request interceptor
instance.interceptors.request.use(
  (config) => {
    // Modify request config here, e.g., add headers
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add global response interceptor
instance.interceptors.response.use(
  (response) => {
    // Modify response data here, if needed
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
```
#### Token and Refresh Token

Access tokens and refresh tokens are fundamental to securing web applications. Access tokens are short-lived tokens that grant access to protected resources. Refresh tokens, on the other hand, are long-lived tokens that can be used to obtain new access tokens.

```javascript
// Generating and managing tokens and refresh tokens in your backend
// This code is typically part of your server-side logic
const generateAccessToken = (user) => {
  // Generate and sign an access token
  // Return the access token
};

const generateRefreshToken = (user) => {
  // Generate and sign a refresh token
  // Return the refresh token
};
```

#### Handling Token Expiration with Axios Interceptors

When access tokens expire, Axios interceptors can be used to automatically detect token expiration and initiate a token refresh.

```javascript
// Implementing an Axios interceptor for automatic token refresh
const axiosInstance = axios.create({ baseURL: 'https://api.example.com' });

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Access token has expired, refresh it
      try {
        const newAccessToken = await refreshAccessToken();
        // Update the request headers with the new access token
        error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
        // Retry the original request
        return axiosInstance(error.config);
      } catch (refreshError) {
        // Handle token refresh error
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);
```

#### Repeating Failed Requests After Token Refresh

During a token refresh, some requests may fail due to token expiration. To address this, we can implement a request queue to store failed requests and retry them once the new access token is obtained.
```javascript
// Implementing a request queue in Axios interceptors
import { AxiosRequestConfig } from 'axios';

// Define the structure of a retry queue item
interface RetryQueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: AxiosRequestConfig;
}

// Create a list to hold the request queue
const refreshAndRetryQueue: RetryQueueItem[] = [];

// Flag to prevent multiple token refresh requests
let isRefreshing = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig = error.config;
    
    if (error.response && error.response.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          // Refresh the access token
          const newAccessToken = await refreshAccessToken();
          
          // Update the request headers with the new access token
          error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
          
          // Retry all requests in the queue with the new token
          refreshAndRetryQueue.forEach(({ config, resolve, reject }) => {
            axiosInstance
              .request(config)
              .then((response) => resolve(response))
              .catch((err) => reject(err));
          });

          // Clear the queue
          refreshAndRetryQueue.length = 0;

          // Retry the original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Handle token refresh error
          // You can clear all storage and redirect the user to the login page
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      // Add the original request to the queue
      return new Promise<void>((resolve, reject) => {
        refreshAndRetryQueue.push({ config: originalRequest, resolve, reject });
      });
    }

    // Return a Promise rejection if the status code is not 401
    return Promise.reject(error);
  }
);
```

#### Explanation:

1.  Retry Queue Item Structure: We define the structure of a retry queue item (`RetryQueueItem`) that includes the `resolve` and `reject` functions (used to resolve or reject the promise associated with a request) and the original request configuration (`config`).
2.  Request Queue Initialization: We create an array called `refreshAndRetryQueue` to hold the failed requests that need to be retried after token refresh.
3.  Token Refresh Flag: The `isRefreshing` flag is used to prevent multiple token refresh requests from happening simultaneously. It ensures that only one token refresh request is made at a time.
4.  Intercept Response: When a response is received, Axios intercepts it and checks if the status code is 401, indicating that the access token has expired.
5.  Token Refresh Process: If the access token has expired and token refresh is not already in progress (`!isRefreshing`), we initiate the token refresh process. We await the new access token and update the headers of the failed requests in the queue with the new token.
6.  Retry Failed Requests: After obtaining the new access token, we iterate through `refreshAndRetryQueue` and retry each request using the updated configuration. Once all requests are retried, we clear the queue.
7.  Add Original Request to Queue: If a request encounters a 401 error during token refresh and a token refresh is in progress, we add the original request configuration to the queue. These requests will be retried once the new access token is available.
8.  Reject Non-401 Errors: If the status code is not 401, we reject the Promise to propagate the error further.

This code ensures that all failed requests are automatically retried with the new access token after a successful token refresh, and it efficiently manages concurrency to avoid redundant token refresh requests.

#### Putting It All Together in a React.js App

Integrate Axios interceptors into your React.js project to handle token expiration and automatically repeat failed requests.
```javascript
// Setting up Axios interceptors in a React.js app
import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance';

function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axiosInstance
      .get('/api/data')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        // Handle errors, including token refresh errors
      });
  }, []);

  return (
    <div className="App">
      {/* Render your app */}
    </div>
  );
}

export default App;
```
#### Conclusion:

Handling authentication, access tokens, token refresh, and automatically repeating failed requests is essential for building secure and reliable React.js applications. Axios interceptors offer a robust solution for managing these aspects, ensuring a smooth and secure user experience.
