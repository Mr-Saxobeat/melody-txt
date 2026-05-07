import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from melodies.models import Melody
from setlists.models import Setlist, SetlistEntry

User = get_user_model()

SAMPLE_MELODIES = [
    ("Escala Maior", "do re mi fa sol la si DO"),
    ("Arpejo Menor", "la do mi la1 do1 mi1"),
    ("Parabéns", "do do re do fa mi\ndo do re do sol fa"),
    ("Blues Riff", "do mib fa fa# sol sib DO"),
    ("Bossa Nova", "||: do mi sol la sol mi :||"),
    ("Ciranda", "sol sol la la sol sol mi\nmi mi fa fa mi mi re"),
    ("Hino Alegre", "mi mi fa sol sol fa mi re\ndo do re mi mi re re"),
    ("Jazz Walk", "do re mib mi sol la sib DO"),
    ("Valsa Simples", "do mi sol | re fa la | mi sol si"),
    ("Samba de Roda", "sol la si DO si la sol\nmi fa sol la sol fa mi"),
    ("Cantiga de Ninar", "sol mi la sol mi\ndo re mi fa re"),
    ("Fuga Bach", "do re mi fa sol la si DO\nDO si la sol fa mi re do"),
    ("Melodia Celta", "re mi sol la sol mi re\ndo re mi sol la sol mi re"),
    ("Rock Riff", "mi mi DO si la la si DO"),
    ("Tema Oriental", "mi fa la si DO\nDO si la fa mi"),
    ("Marchinha", "do do mi mi sol sol mi\nre re fa fa la la fa"),
    ("Acalanto", "sol1 do re mi re do\nsol1 do re mi fa mi re do"),
    ("Frevo", "la si DO RE DO si la\nsol la si DO si la sol"),
    ("Baião", "mi sol la si la sol mi\nre mi sol la sol mi re"),
    ("Choro", "do mi sol la sol mi do\nsi1 re fa sol fa re si1"),
]

SETLIST_NAMES = [
    "Ensaio Segunda", "Show Sexta", "Repertório Igreja",
    "Aula de Música", "Festival", "Jam Session",
    "Aniversário", "Casamento", "Roda de Choro",
    "Sarau", "Recital", "Acústico",
    "Noite de Jazz", "Tarde Musical", "Encontro de Bandas",
]


class Command(BaseCommand):
    help = 'Seed database with 5 users, 4 melodies each, and 3 setlists each'

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        users = []
        for i in range(1, 6):
            username = f"musician{i}"
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@example.com',
                }
            )
            if created:
                user.set_password('Music123!')
                user.save()
                self.stdout.write(f"  Created user: {username}")
            else:
                self.stdout.write(f"  User exists: {username}")
            users.append(user)

        all_melodies = []
        melody_pool = list(SAMPLE_MELODIES)
        random.shuffle(melody_pool)

        for i, user in enumerate(users):
            user_melodies = melody_pool[i * 4:(i + 1) * 4]
            for title, notation in user_melodies:
                melody, created = Melody.objects.get_or_create(
                    user=user,
                    title=title,
                    defaults={
                        'notation': notation,
                        'is_public': True,
                    }
                )
                if created:
                    self.stdout.write(f"  Created melody: {title} ({user.username})")
                all_melodies.append(melody)

        setlist_names = list(SETLIST_NAMES)
        random.shuffle(setlist_names)

        for i, user in enumerate(users):
            for j in range(3):
                name = setlist_names[i * 3 + j]
                setlist, created = Setlist.objects.get_or_create(
                    user=user,
                    title=name,
                    defaults={'is_public': True}
                )
                if created:
                    chosen = random.sample(all_melodies, min(5, len(all_melodies)))
                    for pos, melody in enumerate(chosen):
                        SetlistEntry.objects.create(
                            setlist=setlist,
                            melody=melody,
                            position=pos,
                        )
                    self.stdout.write(f"  Created setlist: {name} ({user.username}, {len(chosen)} melodies)")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Created {len(users)} users, {len(all_melodies)} melodies, {len(users) * 3} setlists."
        ))
        self.stdout.write("\nLogin credentials: musician1/Music123! through musician5/Music123!")
