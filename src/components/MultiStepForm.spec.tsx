import { render, screen, waitFor, within } from '@testing-library/react';
import { MultiStepForm } from './MultiStepForm';
import user from '@testing-library/user-event';

describe('MultiStepForm', () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
    render(<MultiStepForm onSubmit={onSubmit} />);
  });

  it('onSubmit is called when all fields pass validation', async () => {
    user.type(getFirstName(), 'Bruno');
    selectJobSituation('Full-Time');
    user.type(getCity(), 'Vila Real');
    user.click(getMillionaireCheckbox());
    clickNextButton();

    // 2nd step
    user.type(await findMoney(), '1000000');
    clickNextButton();

    // 3rd step
    user.type(await findDescription(), 'hello');
    clickSubmitButton();
    // expect(onSubmit).toHaveBeenCalledWith({ lazy: true }); // it will show the object sent in the form
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        city: 'Vila Real',
        description: 'hello',
        firstName: 'Bruno',
        job: 'FULL',
        millionaire: true,
        money: 1000000,
      });
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('has 3 required fields on first step', async () => {
    clickNextButton(); //react Form doesnt need awaitFor : expect(screen.getByText('Your First Name is Required')).toBeInTheDocument()
    await waitFor(() => {
      expect(getFirstName()).toHaveErrorMessage('Your First Name is Required');
    });

    expect(getCity()).toHaveErrorMessage('city is a required field');
    expect(getSelectJobSituation()).toHaveErrorMessage(
      'You need to select your job situation'
    );
  });
});

describe('city field', () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
    render(<MultiStepForm onSubmit={onSubmit} />);
  });
  it('shows error when city has less than 8 chars', async () => {
    user.type(getCity(), 'Vila');
    user.tab();
    await waitFor(() => {
      expect(getCity()).toHaveErrorMessage(
        'city must be at least 8 characters'
      );
    });
  });

  it('shows error when city has more than 11 chars', async () => {
    user.type(getCity(), 'Vila Real 1234576788');
    user.tab();

    await waitFor(() => {
      expect(getCity()).toHaveErrorMessage(
        'city must be at most 11 characters'
      );
    });
  });
});

describe('money field', () => {
  const onSubmit = jest.fn();

  beforeEach(() => {
    onSubmit.mockClear();
    render(<MultiStepForm onSubmit={onSubmit} />);
  });
  it('shows error when money is lower than 1000000', async () => {
    user.type(getFirstName(), 'Bruno');
    selectJobSituation('Full-Time');
    user.type(getCity(), 'Vila Real');
    user.click(getMillionaireCheckbox());
    clickNextButton();

    // 2nd step
    user.type(await findMoney(), '100');
    clickNextButton();

    await waitFor(async () => {
      expect(await findMoney()).toHaveErrorMessage(
        'Because you said you are a millionaire you need to have 1 million'
      );
    });
  });
});

function clickSubmitButton() {
  user.click(screen.getByRole('button', { name: /Submit/i }));
}

function findDescription() {
  return screen.findByRole('textbox', { name: /description/i });
}

function findMoney() {
  return screen.findByRole('spinbutton', { name: /All the money I have/i });
}

function clickNextButton() {
  user.click(screen.getByRole('button', { name: /Next/i }));
}

function getMillionaireCheckbox() {
  return screen.getByRole('checkbox', { name: /i am a millionaire/i });
}

function getCity() {
  return screen.getByRole('textbox', { name: /city/i });
}

function getFirstName() {
  return screen.getByRole('textbox', { name: /first name/i });
}

function getSelectJobSituation() {
  return screen.getByRole('combobox', { name: /job situation/i });
}

function selectJobSituation(jobSituation: string) {
  const dropdown = getSelectJobSituation();
  user.selectOptions(
    dropdown,
    within(dropdown).getByRole('option', { name: jobSituation })
  );
}
