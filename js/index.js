class QuestionElement {
  constructor(questionGroup, el, label, index) {
    this.questionGroup = questionGroup;
    this.el = el;
    this.label = label;
    this.index = index;
    this.el.addEventListener('click', this.handleClick.bind(this));
    this.el.addEventListener('focusin', this.handleFocusIn.bind(this));
    this.el.addEventListener('focusout', this.handleFocusOut.bind(this));
  }

  handleClick(event) {
    this.questionGroup.select(this.index);
  }

  handleFocusIn(event) {
    this.questionGroup.select(this.index);
  }

  handleFocusOut(event) {
    this.questionGroup.deselect(this.index);
  }
}

class QuestionGroup {
  constructor(questionElements, selectedClassName) {
    this.selectedClassName = selectedClassName;
    this.questionElements = questionElements.map(
      ({ question, label }, index) =>
        new QuestionElement(this, question, label, index)
    );
  }

  select(index) {
    for (let i = 0; i < this.questionElements.length; i++) {
      let el = this.questionElements[i].el;
      if (index === i) {
        el.classList.add(this.selectedClassName);
      } else {
        el.classList.remove(this.selectedClassName);
      }
    }
    this.questionElements[index].label.focus();
  }

  deselect(index) {
    this.questionElements[index].el.classList.remove(this.selectedClassName);
  }
}

class AriaRadioElement {
  constructor(radioGroup, label, input, index) {
    this.radioGroup = radioGroup;
    this.label = label;
    this.input = input;
    this.index = index;
    this.label.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.label.addEventListener('click', this.handleClick.bind(this));
  }

  handleKeyDown(event) {
    switch (event.keyCode) {
      case 32: // SPACE
        event.preventDefault();
        this.radioGroup.select(this.index);
        break;
      case 37: // LEFT
      case 38: // UP
        event.preventDefault();
        this.radioGroup.selectPrevious(this.index);
        break;
      case 39: // RIGHT
      case 40: //DOWN
        event.preventDefault();
        this.radioGroup.selectNext(this.index);
        break;
    }
  }

  handleClick(event) {
    event.preventDefault();
    this.radioGroup.select(this.index);
  }
}

class AriaRadioGroup {
  constructor(radioElements) {
    this.radioElements = radioElements.map(
      (radioElement, index) =>
        new AriaRadioElement(
          this,
          radioElement,
          radioElement.previousElementSibling,
          index
        )
    );
    this.selected = 0;
  }

  selectNext(index) {
    this.selected = index + 1;
    if (this.selected === this.radioElements.length) {
      this.selected = 0;
    }
    this.select();
  }

  selectPrevious(index) {
    this.selected = index - 1;
    if (this.selected < 0) {
      this.selected = this.radioElements.length - 1;
    }
    this.select();
  }

  select(index = this.selected) {
    for (let radioElement of this.radioElements) {
      radioElement.label.setAttribute('aria-checked', false);
      radioElement.label.setAttribute('tabindex', -1);
      radioElement.input.removeAttribute('checked');
    }
    let radio = this.radioElements[index];
    radio.label.setAttribute('aria-checked', true);
    radio.label.setAttribute('tabindex', 0);
    radio.input.setAttribute('checked', true);
    radio.label.focus();
  }
}

class AriaCheckboxElement {
  constructor(label, input) {
    this.label = label;
    this.input = input;
    this.label.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.label.addEventListener('click', this.handleClick.bind(this));
  }

  toggle() {
    if (this.input.hasAttribute('checked')) {
      this.label.removeAttribute('aria-checked');
      this.input.removeAttribute('checked');
    } else {
      this.label.setAttribute('aria-checked', true);
      this.input.setAttribute('checked', true);
    }
  }

  handleKeyDown(event) {
    switch (event.keyCode) {
      case 32: // SPACE
        event.preventDefault();
        this.toggle();
    }
  }

  handleClick(event) {
    event.preventDefault();
    this.toggle();
  }
}

class Form {
  constructor(form, fields, requiredFields) {
    this.form = form;
    this.requiredFields = requiredFields;
    this.fields = fields;
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  validateText(elements) {
    return elements.every(element => Boolean(element.value));
  }

  validateRadio(elements) {
    return elements.some(element => Boolean(element.hasAttribute('checked')));
  }

  valid() {
    return this.requiredFields.every(requiredField => {
      let fields = this.fields.filter(
        field => field.name === requiredField.name
      );
      return requiredField.type === 'text'
        ? this.validateText(fields)
        : requiredField.type === 'radio'
          ? this.validateRadio(fields)
          : false;
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    alert(
      this.valid()
        ? 'Your form has been submitted!'
        : 'There are errors with your form'
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let questions = document.querySelectorAll('.question');
  new QuestionGroup(
    Array.from(questions).map(question => {
      let label = question.querySelector('label');
      return { question, label };
    }),
    'question--selected'
  );

  let radioGroups = document.querySelectorAll('[role="radiogroup"]');
  radioGroups.forEach(
    radioGroup =>
      new AriaRadioGroup(
        Array.from(radioGroup.querySelectorAll('[role="radio"]'))
      )
  );

  let checkboxes = document.querySelectorAll('[role="checkbox"]');
  checkboxes.forEach(
    checkbox =>
      new AriaCheckboxElement(checkbox, checkbox.previousElementSibling)
  );

  let form = document.querySelector('form');
  new Form(form, Array.from(form.querySelectorAll('input')), [
    { name: 'name', type: 'text' },
    { name: 'email', type: 'text' },
    { name: 'age', type: 'text' },
    { name: 'recommend', type: 'radio' }
  ]);
});
