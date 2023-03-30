import requests
import openai
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def generate_chat_response(prompt):
    """
    Generates chatbot response based on OpenAI prompt.
    """
    model_engine = "text-davinci-002"
    response = openai.Completion.create(
        engine=model_engine,
        prompt=prompt,
        max_tokens=2048,
        n=1,
        stop=None,
        temperature=0.7,
    )
    message = response.choices[0].text.strip()
    return message

def call_chat_gpt_question(pregunta):
    """
    Calls the API to get a GPT question.
    """
    response = generate_chat_response(pregunta)
    return response

@app.route('/get_chatbot_response/<codigo>', methods=['GET'])
def get_chatbot_response(codigo):
    # Get opp_id from form data submitted by user
    opp_id = codigo
    
    # Initialize the OpenAI API client
    openai.api_key = "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"

    # Write the Postman API link
    url = f'https://torre.co/api/suite/opportunities/{opp_id}'

    headers = {'Accept': 'application/json'}

    # Send GET request to url using headers and store response in variable `response`
    response = requests.get(url, headers=headers)

    # Get JSON data from response and store it in variable `data`
    data = response.json()

    # Assign some variables inside the JSON to new variables
            #First for torre_description
    details_sections = data["details"]
    responsibilities_content = None
    for section in details_sections:
        if section['code'] == 'responsibilities':
                responsibilities_content = section['content']
    if responsibilities_content:
        torre_description = responsibilities_content

    torre_titule = data["objective"]

    organization = data["organizations"][0]["name"]

    pregunta = f"Please list the top 5 most relevant hard skills according to '{torre_description}'"
    response_hard_skills = call_chat_gpt_question(pregunta)

    pregunta2 = f"Act as a copywriter and improve this job description: '{torre_description}', also put emojis at the beginning of every sentence"
    response_spelling = call_chat_gpt_question(pregunta2)

    pregunta3 = f"Please search for information about this organization: '{organization}', and write a short tagline about it, no more than 20 words, finally add an emoji at the end of the sentence"
    response_tagline = call_chat_gpt_question(pregunta3)

    data = {
        'Titulo' : torre_titule,
        'Skills': response_hard_skills,
        'description': torre_description,
        'spelling': response_spelling,  
        'tagline': response_tagline
    }

    return jsonify(data) 

if __name__ == '__main__':
    app.run(debug=True)
