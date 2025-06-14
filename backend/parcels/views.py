from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Temporary in-memory parcel list
PARCELS = []

@csrf_exempt
def create_parcel(request):
    if request.method == "POST":
        data = json.loads(request.body)
        PARCELS.append(data)
        return JsonResponse({"message": "Parcel created successfully!"}, status=201)
    return JsonResponse({"error": "Invalid request"}, status=400)

def all_parcels(request):
    return JsonResponse(PARCELS, safe=False)
