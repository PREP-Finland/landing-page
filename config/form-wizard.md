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
          - value: under-30
            labelKey: formWizard.step1.ageUnder30
          - value: 31-40
            labelKey: formWizard.step1.age3140
          - value: 41-50
            labelKey: formWizard.step1.age4150
          - value: 50+
            labelKey: formWizard.step1.age50plus
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
        autoComplete: name
      - name: email
        type: email
        labelKey: formWizard.step3.email
        required: true
        autoComplete: email
      - name: phone
        type: tel
        labelKey: formWizard.step3.phone
        required: false
        autoComplete: tel
      - name: dataConsent
        type: checkbox
        labelKey: formWizard.step3.dataConsent
        required: true
        privacyPolicyUrl: /privacy
---
