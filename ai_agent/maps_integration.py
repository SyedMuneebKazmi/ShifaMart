"""
Google Maps Integration for ShifaMart+ AI Agent
Helps users find specialists near their location
"""
import os
import urllib.parse
from typing import Dict, Optional, List


class MapsIntegration:
    """
    Integrates with Google Maps to help find specialists.
    Generates search URLs and provides location-based guidance.
    """
    
    # Major cities in Pakistan with coordinates
    PAKISTAN_CITIES = {
        'karachi': {'lat': 24.8607, 'lng': 67.0011, 'name': 'Karachi'},
        'lahore': {'lat': 31.5204, 'lng': 74.3587, 'name': 'Lahore'},
        'islamabad': {'lat': 33.6844, 'lng': 73.0479, 'name': 'Islamabad'},
        'rawalpindi': {'lat': 33.5651, 'lng': 73.0169, 'name': 'Rawalpindi'},
        'faisalabad': {'lat': 31.4504, 'lng': 73.1350, 'name': 'Faisalabad'},
        'multan': {'lat': 30.1575, 'lng': 71.5249, 'name': 'Multan'},
        'peshawar': {'lat': 34.0151, 'lng': 71.5249, 'name': 'Peshawar'},
        'quetta': {'lat': 30.1798, 'lng': 66.9750, 'name': 'Quetta'},
        'sialkot': {'lat': 32.4945, 'lng': 74.5229, 'name': 'Sialkot'},
        'gujranwala': {'lat': 32.1877, 'lng': 74.1945, 'name': 'Gujranwala'},
        'hyderabad': {'lat': 25.3960, 'lng': 68.3578, 'name': 'Hyderabad'},
        'bahawalpur': {'lat': 29.3956, 'lng': 71.6836, 'name': 'Bahawalpur'},
        'sargodha': {'lat': 32.0740, 'lng': 72.6861, 'name': 'Sargodha'},
        'sukkur': {'lat': 27.7052, 'lng': 68.8574, 'name': 'Sukkur'},
        'larkana': {'lat': 27.5570, 'lng': 68.2028, 'name': 'Larkana'},
        'abbottabad': {'lat': 34.1688, 'lng': 73.2215, 'name': 'Abbottabad'},
        'mardan': {'lat': 34.1986, 'lng': 72.0404, 'name': 'Mardan'},
        'mingora': {'lat': 34.7717, 'lng': 72.3600, 'name': 'Mingora'},
    }
    
    # Specialist search terms for Google Maps
    SPECIALIST_SEARCH_TERMS = {
        'cardiologist': 'cardiologist heart specialist doctor',
        'dermatologist': 'dermatologist skin specialist doctor',
        'gastroenterologist': 'gastroenterologist stomach specialist doctor',
        'neurologist': 'neurologist brain nerve specialist doctor',
        'orthopedic': 'orthopedic bone joint specialist doctor',
        'pulmonologist': 'pulmonologist lung chest specialist doctor',
        'endocrinologist': 'endocrinologist diabetes thyroid specialist doctor',
        'urologist': 'urologist kidney bladder specialist doctor',
        'gynecologist': 'gynecologist women health specialist doctor',
        'hepatologist': 'hepatologist liver specialist doctor',
        'nephrologist': 'nephrologist kidney specialist doctor',
        'ophthalmologist': 'ophthalmologist eye specialist doctor',
        'ent': 'ENT ear nose throat specialist doctor',
        'psychiatrist': 'psychiatrist mental health specialist doctor',
        'oncologist': 'oncologist cancer specialist doctor',
        'rheumatologist': 'rheumatologist arthritis specialist doctor',
        'allergist': 'allergist immunologist specialist doctor',
        'infectious_disease': 'infectious disease specialist doctor',
        'general_physician': 'general physician doctor clinic',
        'emergency': 'emergency hospital ER',
    }
    
    # Healthcare apps/websites in Pakistan
    HEALTHCARE_APPS = [
        {'name': 'Marham', 'url': 'https://www.marham.pk', 'description': 'Find and book doctors online'},
        {'name': 'oladoc', 'url': 'https://oladoc.com', 'description': 'Book appointments with specialists'},
        {'name': 'Sehat', 'url': 'https://sehat.com.pk', 'description': 'Healthcare directory'},
        {'name': 'Healthwire', 'url': 'https://healthwire.pk', 'description': 'Find doctors and hospitals'},
    ]
    
    def get_city_info(self, city_name: str) -> Optional[Dict]:
        """Get city information from name"""
        city_key = city_name.lower().strip()
        
        # Direct match
        if city_key in self.PAKISTAN_CITIES:
            return self.PAKISTAN_CITIES[city_key]
        
        # Partial match
        for key, info in self.PAKISTAN_CITIES.items():
            if city_key in key or key in city_key:
                return info
        
        return None
    
    def generate_google_maps_url(self, specialist_key: str, city: str = None) -> str:
        """
        Generate Google Maps search URL for finding a specialist.
        """
        search_term = self.SPECIALIST_SEARCH_TERMS.get(
            specialist_key, 
            f'{specialist_key} doctor'
        )
        
        if city:
            city_info = self.get_city_info(city)
            if city_info:
                search_term += f" near {city_info['name']}"
            else:
                search_term += f" near {city}"
        
        encoded_query = urllib.parse.quote(search_term)
        return f"https://www.google.com/maps/search/{encoded_query}"
    
    def generate_marham_url(self, specialist_key: str, city: str = None) -> str:
        """Generate Marham.pk search URL"""
        specialist_map = {
            'cardiologist': 'cardiologist',
            'dermatologist': 'dermatologist',
            'gastroenterologist': 'gastroenterologist',
            'neurologist': 'neurologist',
            'orthopedic': 'orthopedic-surgeon',
            'pulmonologist': 'pulmonologist',
            'urologist': 'urologist',
            'gynecologist': 'gynecologist',
            'general_physician': 'general-physician',
        }
        
        specialist_slug = specialist_map.get(specialist_key, 'doctors')
        city_slug = city.lower().replace(' ', '-') if city else 'pakistan'
        
        return f"https://www.marham.pk/{specialist_slug}/{city_slug}"
    
    def get_location_search_response(self, specialist_info: Dict, city: str = None) -> Dict:
        """
        Generate a comprehensive response with location search options.
        """
        specialist_key = specialist_info.get('key', 'general_physician')
        specialist_name = specialist_info.get('name', 'Doctor')
        
        # Generate URLs
        google_maps_url = self.generate_google_maps_url(specialist_key, city)
        marham_url = self.generate_marham_url(specialist_key, city)
        
        city_display = city.title() if city else "your area"
        
        response = {
            'message': f"🗺️ **Finding {specialist_name} in {city_display}**\n\n",
            'google_maps_url': google_maps_url,
            'marham_url': marham_url,
            'healthcare_apps': self.HEALTHCARE_APPS,
            'city': city,
            'specialist': specialist_name
        }
        
        # Build detailed message
        response['message'] += f"**Quick Links:**\n\n"
        response['message'] += f"🔗 [Search on Google Maps]({google_maps_url})\n"
        response['message'] += f"🔗 [Find on Marham.pk]({marham_url})\n\n"
        
        response['message'] += f"**Healthcare Apps:**\n"
        for app in self.HEALTHCARE_APPS[:3]:
            response['message'] += f"• {app['name']}: {app['url']}\n"
        
        response['message'] += f"\n**Helplines:**\n"
        response['message'] += f"• 🚑 Rescue: 1122\n"
        response['message'] += f"• 🏥 Edhi: 115\n"
        response['message'] += f"• ☎️ Health Helpline: 1166\n"
        
        return response
    
    def get_city_prompt(self) -> str:
        """Get prompt to ask user for city"""
        cities = list(self.PAKISTAN_CITIES.values())[:8]
        city_names = [c['name'] for c in cities]
        
        return (
            "🏙️ **Which city are you in?**\n\n"
            f"Popular cities: {', '.join(city_names)}\n\n"
            "Please type your city name:"
        )
    
    def is_valid_city(self, city_name: str) -> bool:
        """Check if city name is valid/recognized"""
        return self.get_city_info(city_name) is not None or len(city_name) >= 3


# Singleton instance
maps_integration = MapsIntegration()

