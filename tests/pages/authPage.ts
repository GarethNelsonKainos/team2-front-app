import type { Locator, Page } from '@playwright/test';
 
export type RegistrationData = {
  firstName: string;
  secondName: string;
  email: string;
  password: string;
  confirmedPassword: string;
};
 
export type LoginData = {
  email: string;
  password: string;
};
 
export class AuthPage {
  constructor(private readonly page: Page) {}
 
  async gotoLogin(redirect?: string) {
    const url = redirect
      ? `http://localhost:3001/login?redirect=${encodeURIComponent(redirect)}`
      : 'http://localhost:3001/login';
 
    await this.page.goto(url);
  }
 
  async gotoRegisterTab() {
    await this.gotoLogin();
    await this.page.getByRole('tab', { name: 'Register' }).click();
  }
 
  async fillRegistrationForm(data: RegistrationData) {
    await this.page.getByRole('textbox', { name: 'First Name:' }).fill(data.firstName);
    await this.page.getByRole('textbox', { name: 'Surname:' }).fill(data.secondName);
    await this.page.getByRole('textbox', { name: 'Email:' }).fill(data.email);
    await this.page.getByRole('textbox', { name: 'Password:', exact: true }).fill(data.password);
    await this.page.getByRole('textbox', { name: 'Confirm Password:' }).fill(data.confirmedPassword);
  }
 
  async submitRegistration() {
    await this.page.getByRole('button', { name: 'Register' }).click();
  }
 
  async blurEmptyRegisterRequiredFields() {
    await this.page.getByRole('textbox', { name: 'First Name:' }).click();
    await this.page.getByRole('textbox', { name: 'First Name:' }).press('Tab');
 
    await this.page.getByRole('textbox', { name: 'Email:' }).click();
    await this.page.getByRole('textbox', { name: 'Email:' }).press('Tab');
  }
 
  async fillLoginForm(data: LoginData) {
    await this.page.getByRole('textbox', { name: 'Email:' }).fill(data.email);
    await this.page.getByRole('textbox', { name: 'Password:' }).fill(data.password);
  }
 
  async submitLogin() {
    await this.page.getByRole('button', { name: 'Submit' }).click();
  }
 
  alert(): Locator {
    return this.page.getByRole('alert');
  }
 
  registerEmailError(): Locator {
    return this.page.locator('#registerEmailError');
  }
 
  registerConfirmPasswordError(): Locator {
    return this.page.locator('#registerConfirmPasswordError');
  }
 
  registerFirstNameError(): Locator {
    return this.page.locator('#registerFirstNameError');
  }
 
  loginSubmitButton(): Locator {
    return this.page.getByRole('button', { name: 'Submit' });
  }
}