// Generated from: tests/features/jobRoleDetails.feature
import { test } from "playwright-bdd";

test.describe('Job Role Details Page', () => {

  test('displays complete job role details and can navigate back', async ({ Given, When, Then, And, page }) => { 
    await Given('I am on the home page', null, { page }); 
    await When('I open all job roles', null, { page }); 
    await And('I open a job role', null, { page }); 
    await Then('I should see complete job role details', null, { page }); 
    await When('I go back to the job roles list', null, { page }); 
    await Then('I should be on the job roles page', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/features/jobRoleDetails.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":3,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":4,"keywordType":"Context","textWithKeyword":"Given I am on the home page","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":5,"keywordType":"Action","textWithKeyword":"When I open all job roles","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"And I open a job role","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then I should see complete job role details","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":8,"keywordType":"Action","textWithKeyword":"When I go back to the job roles list","stepMatchArguments":[]},{"pwStepLine":12,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"Then I should be on the job roles page","stepMatchArguments":[]}]},
]; // bdd-data-end