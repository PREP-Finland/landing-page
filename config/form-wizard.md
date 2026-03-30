---
steps:
  - id: profile
    titleKey: formWizard.step1.title
    fields:
      - name: profileType
        type: radio
        labelKey: formWizard.step1.profileType
        required: true
        options:
          - value: entrepreneur
            labelKey: formWizard.step1.entrepreneur
          - value: demanding_professional
            labelKey: formWizard.step1.demandingProfessional
          - value: competitive_athlete
            labelKey: formWizard.step1.competitiveAthlete
          - value: results_oriented
            labelKey: formWizard.step1.resultsOriented
      - name: ageRange
        type: select
        labelKey: formWizard.step1.ageRange
        required: true
        showIf: profileType
        options:
          - value: 18-25
            labelKey: formWizard.step1.age1825
          - value: 25-35
            labelKey: formWizard.step1.age2535
          - value: 35-45
            labelKey: formWizard.step1.age3545
          - value: 45+
            labelKey: formWizard.step1.age45plus
  - id: goals
    titleKey: formWizard.step2.title
    fields:
      - name: goals
        type: textarea
        labelKey: formWizard.step2.goalsLabel
        required: true
  - id: contact
    titleKey: formWizard.step3.title
    fields:
      - name: name
        type: text
        labelKey: formWizard.step3.name
        required: true
      - name: phone
        type: tel
        labelKey: formWizard.step3.phone
        required: true
      - name: email
        type: email
        labelKey: formWizard.step3.email
        required: true
---
