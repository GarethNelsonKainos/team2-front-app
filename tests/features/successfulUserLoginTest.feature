Feature: successful user login Test

    Scenario: user logs in and is redirected to home page
        Given that i am on the home page
        When i click the login button
        Then I should be redirected to login page
        When i submit valid login credentials
        Then I should be redirected to home page
        Then I should be logged in and see my name on the homepage
        Then I can see the profile link
        Then I can see my recent applications
        And I should see the logout link
        And I should be able to log out






