import google.generativeai as genai

def get_short_response(prompt, api_key):
    # Configure the API key
    genai.configure(api_key=api_key)

    # Set up the model
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Configure for short responses
    generation_config = {
        'temperature': 0.7,
        'max_output_tokens': 100,  # Limit output length
        'top_p': 0.8,
    }
    
    # Generate response with constraints for brevity
    response = model.generate_content(
        f"Give a very brief and concise response to: {prompt}. Keep it under 50 words.",
        generation_config=generation_config
    )
    
    return response.text

if __name__ == "__main__":
    # Replace with your actual API key
    API_KEY = "AIzaSyCzQC0ZaTWCYUzfxQ69ANfPKPDOtt9aDWU"
    
    while True:
        user_prompt = input("\nEnter your question (or 'quit' to exit): ")
        if user_prompt.lower() == 'quit':
            break
            
        try:
            response = get_short_response(user_prompt, API_KEY)
            print("\nGemini's response:")
            print(response)
        except Exception as e:
            print(f"An error occurred: {e}") 