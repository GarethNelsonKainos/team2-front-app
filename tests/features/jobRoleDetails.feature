Feature: Job Role Details Page

  Scenario: displays complete job role details and can navigate back
    Given I am on the home page
    When I open all job roles
    And I open a job role
    Then I should see complete job role details
    When I go back to the job roles list
    Then I should be on the job roles page