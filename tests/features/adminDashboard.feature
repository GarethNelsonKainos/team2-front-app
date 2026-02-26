Feature: Admin Dashboard Actions

    Scenario: Admin can navigate to all roles from the dashboard
        Given I am logged in as an admin
        When I navigate to the admin dashboard
        Then I should see a link to view all roles
        When I click on the link to view all roles
        Then I should redirect to the job roles page