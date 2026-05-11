from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from melodies.models import Melody, MelodyTab
from setlists.models import Setlist, SetlistEntry

User = get_user_model()


class Command(BaseCommand):
    help = 'Clear all data except the admin user. Instrument definitions are hardcoded constants (not DB rows).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--no-input',
            action='store_true',
            help='Skip confirmation prompt',
        )

    def handle(self, *args, **options):
        if not options['no_input']:
            confirm = input("This will delete all melodies, tabs, setlists, and non-admin users. Continue? [y/N] ")
            if confirm.lower() not in ('y', 'yes'):
                self.stdout.write("Aborted.")
                return

        setlist_entry_count = SetlistEntry.objects.count()
        SetlistEntry.objects.all().delete()
        self.stdout.write(f"  Deleted {setlist_entry_count} setlist entries")

        setlist_count = Setlist.objects.count()
        Setlist.objects.all().delete()
        self.stdout.write(f"  Deleted {setlist_count} setlists")

        tab_count = MelodyTab.objects.count()
        MelodyTab.objects.all().delete()
        self.stdout.write(f"  Deleted {tab_count} melody tabs")

        melody_count = Melody.objects.count()
        Melody.objects.all().delete()
        self.stdout.write(f"  Deleted {melody_count} melodies")

        non_admin_users = User.objects.filter(is_superuser=False)
        user_count = non_admin_users.count()
        non_admin_users.delete()
        self.stdout.write(f"  Deleted {user_count} non-admin users")

        admin_users = User.objects.filter(is_superuser=True).values_list('username', flat=True)
        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Database cleared. Remaining admin users: {list(admin_users)}"
        ))
