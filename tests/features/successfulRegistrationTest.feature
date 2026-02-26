Feature: Successful Registration Test

	Scenario: registers a new user and lands on the home page
		Given I am on the registration page
		When I submit valid registration details
		Then I should see successful registration
		And I should be redirected to the home page
		And I should be logged in

