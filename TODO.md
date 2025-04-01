1. No Loading when navigating to another page

## Authentication Bugs

[] 1. No token expiration handling - tokens remain valid indefinitely
[x] 2. Doesn't handle duplicate email
[] 3. Email validation regex isn't complete - it will accept invalid emails
[x] 4. No maximum password length validation, allowing extremely long passwords
[] 5. No validation for phone number format
[x] 6. Login/Register doesn't do anything after showing success message
[x] 7. Able to place order without being logged in

## Restaurant Listing and Details Bugs

[x] 1. Categories aren't properly visible
(Not able to replicate)[] 2. Pagination is not working, skipping first page
[x] 3. No warning when adding items from different restaurants
[x] 4. No warning when adding items from closed restaurants
[x] 5. "Add" button isn't disabled for unavailable items

## Cart & Checkout Bugs

[x] 1. Allows adding items from different restaurants without warning or clearing cart
[x] 2. Doesn't validate if restaurant is open before adding to cart
[x] 3. Allows setting negative or zero quantities
{no able to replicate}[] 4. Subtotal calculation is wrong when item price is greater than 25
[] 5. Cart persistence issues when navigating between pages
[x] 6. Negative quantity is allowed
[] 7. No Credit Card Validation
[] 8. Address validation allows invalid formats
[] 9. Orders can sometimes be placed without payment verification
[] 10. Delivery time estimates don't account for order volume
[] 11. Order minimum quantity is not enforced

## Restaurant Model Bugs

[x] 1. When calculating average rating, it doesn't round properly
[] 2. Delivery time calculation doesn't account for peak hours
[] 3. Free delivery logic has edge cases that don't work
[] 4. When items are marked unavailable, they still appear in search and can be added to cart
[] 5. Restaurant appears as open even when closed for certain hours
[] 6. Featured restaurants sometimes don't appear at the top

## API Endpoint Bugs

1. Pagination offset calculation is wrong (uses page _ limit instead of (page-1) _ limit) in restaurants endpoint
2. Case-sensitive search for restaurant names that won't find all matches
3. Doesn't properly handle array of cuisines as query parameters
4. Featured filter converts string 'false' to boolean true
5. Sort is applied after the query instead of during the query for efficiency
6. Count doesn't apply the same filters as the actual query
7. Inconsistent response format across different endpoints
8. hasMore pagination calculation is incorrect
9. Returns 405 status but doesn't set Allow header for unsupported methods
10. Generic error handling doesn't distinguish between different types of errorsi