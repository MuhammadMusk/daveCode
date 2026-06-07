from django.core.management.base import BaseCommand

from skills.models import Skill, SkillCategory


DEFAULT_SKILLS = [
    ("Mathematics", SkillCategory.ACADEMIC),
    ("Physics", SkillCategory.ACADEMIC),
    ("Chemistry", SkillCategory.ACADEMIC),
    ("Computer Programming", SkillCategory.TECH),
    ("Web Development", SkillCategory.TECH),
    ("Data Analysis (Excel)", SkillCategory.VOCATIONAL),
    ("Graphic Design", SkillCategory.VOCATIONAL),
    ("Public Speaking", SkillCategory.OTHER),
]


class Command(BaseCommand):
    help = "Seed default skills for demo/testing."

    def handle(self, *args, **options):
        created = 0
        for name, cat in DEFAULT_SKILLS:
            _, was_created = Skill.objects.get_or_create(name=name, defaults={"category": cat})
            created += 1 if was_created else 0
        self.stdout.write(self.style.SUCCESS(f"Seeded skills. Created {created} new skills."))

