from flask import Flask, render_template, request, jsonify
import google.generativeai as genai  # Correct library for Gemini

app = Flask(__name__)

# Set your Gemini API key
genai.configure(api_key="AIzaSyCmHu6-JMqqCOMuPDt57ITAAGp9NbSWPfg")  # Replace with your actual Gemini API key

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.get_json().get('message')
    
    try:
        # Use Gemini model
        model = genai.GenerativeModel("gemini-pro")  # Use "gemini-pro" or "gemini-1.5-pro"
        response = model.generate_content(user_message)

        chatbot_reply = response.text if hasattr(response, "text") else "No response received."
    except Exception as e:
        chatbot_reply = f"Error: {str(e)}"

    return jsonify({"reply": chatbot_reply})

if __name__ == '__main__':
    app.run(debug=True)
