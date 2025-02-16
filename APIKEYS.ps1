API Key:
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

$headers = @{
    "Authorization" = "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"
    "Content-Type" = "application/json"
}

$body = @{
    "user_id" = 1
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/generate_recipe/" -Method Post -Headers $headers -Body $body
