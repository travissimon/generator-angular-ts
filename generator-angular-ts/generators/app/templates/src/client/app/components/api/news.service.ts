/// <reference path="../../typings/app.d.ts" />

module app.components.api {
    'use strict';

	export class NewsService {
		private articles: IArticle[] = [{
			id: 1,
			title: 'Report: You’re Actually Saving Money With Roller Rink Membership',
			subhead: null,
			date: new Date(2014, 10, 23),
			dateline: 'Franklin, In',
			body: 'Explaining that you would earn all your money back by attending just three Rock ‘N’ Roll Blackout nights, a report released this week by the Franklin Skate Center confirmed that you’re actually saving yourself money by purchasing an annual membership. “While the $55 membership package appears expensive at first, once discounted entry, priority parking, and a subscription to the rink’s monthly newsletter, Spin, are factored in, the annual pass makes far more monetary sense than paying $20 per visit,” the report read in part, adding that all new members also receive free premium laces from the WonderWheels Pro Shop, a $10 value on their own. “And these calculations don’t even take into account the complimentary knee and elbow pad rentals and half-off glow-in-the-dark jewelry for members. Therefore, it is our conclusion that this is the best roller rink value in the Central Indiana area.” The report went on to state that for only $10 extra, the Ultimate VIP Package includes a free large cheese pizza on your birthday and $15 in game room tokens.',
		}, {
			id: 2,
			title: 'Bleary-Eyed Coworker Up All Night Generating More Work For You',
			subhead: null,
			date: new Date(2015, 5, 3),
			dateline: 'Bangore, Me',
			body: 'Office personnel coordinator Clem Chesterton, who was hired by your superiors last year to track work flow, project progress, and employee efficiency in your department, spent a sleepless Sunday night completing his assigned task of making sure you are working as much as humanly possible. "We\'re trying to make sure everyone does a pass-check on the spreadsheet package that comes across their desk in the aftrnons [sic]," Chesterton\'s 2:44 a.m. e-mail to you read in part. "Keep in mins [sic] that these measures are being put in place to help us get more work done, despite the new mandatory meetings on Tuesdays, Thursdays, and Fridays, outlined below." Chesterton is currently considered the darling of upper management due to the bathroom-attendance-tracking chart he drafted at 4 a.m. Christmas Eve.',
		}, {
			id: 3,
			title: 'Toyota Recalls 1993 Camry Due To Fact That Owners Really Should Have Bought Something New By Now',
			subhead: null,
			date: new Date(2015, 5, 20),
			dateline: 'Tokyo',
			body: 'Saying it was simply time for drivers to move on, Toyota Motor Corp. issued a recall of its entire 1993 Camry model line Wednesday due to the fact that its owners really should have bought something new by now. “We understand that the 1993 Camry was tremendously dependable, but, honestly, there’s just no excuse for driving a 22-year-old car at this point,” said Toyota spokesman Haruki Kinoshita, adding that, with all the advances in automotive technology that have taken place, no one really had any business driving a vehicle for more than two decades. “We’re not saying you have to buy a new 2015 Camry or splurge on a flashy new hybrid, or even that your new car has to be a Toyota at all. But the bottom line is that you need to start fresh, however you choose to do so.” While Toyota is reportedly confining its recall to the 1993 Camry, it also issued a warning to owners of 1994 to 1998 models alerting them to the fact that they were really starting to push it.',
		}, {
			id: 4,
			title: 'Police Assure Residents Kidnapping Was Only One Of Those Custody-Related Ones',
			subhead: '‘Nothing To Worry About,’ Officials Say',
			date: new Date(2015, 5, 26),
			dateline: 'Portage, In',
			body: 'Saying it barely counted as an abduction at all, officials from the Portage Police Department assured residents that a reported kidnapping Tuesday morning was just one of those custody-related ones. “While three young children are indeed missing from their home and their whereabouts are unknown, we’d like the public to know there’s no need to be alarmed, as this is merely an instance where a frustrated dad refused to return the kids to their mother at the end of the visitation weekend—that’s it,” said Police Chief Dexter Reynolds, adding that, while the father did drive the children across state lines before informing his ex-wife during an angry phone call that they would be living with him permanently, this isn’t one of those situations where the kids are in danger of being murdered or locked in a basement for three months. “Everybody can relax. This guy’s just a resentful father, not some sort of pedophile or serial kidnapper. Nobody’s getting molested. He definitely committed a crime and we will apprehend him, but honestly, the kids are probably fine.” Reynolds went on to say that he regretted causing such a stir with the Amber Alert.',
		}, {
			id: 5,
			title: 'Director Seeking Relatively Unknown Actress For Next Affair',
			subhead: null,
			byline: null,
			date: new Date(2015, 5, 27),
			dateline: 'Los Angeles',
			body: 'Saying that he’s going for a certain look and will know it when he sees it, feature film director Peter Hastings, 52, confirmed to reporters Wednesday that he hopes to find a relatively unknown actress for his next extramarital affair. “I’m definitely looking for someone fairly new to Hollywood, a face that isn’t already too familiar,” said Hastings, who noted that going with an ingénue in her early 20s over a better-established actress could provide just the kind of novelty he has in mind. “With the right person, youth isn’t necessarily a bad thing. Younger actresses are often more willing to take chances, and they tend to take direction well, too.” Hastings later acknowledged that the process may take some time, but said he is prepared to evaluate as many actresses as necessary in order to find the perfect fit.',
		}];

		$inject = ['$log', '$q', '$timeout'];
		constructor(private $log: ng.ILogService, private $q: ng.IQService, private $timeout: ng.ITimeoutService) {
		}

		private getRandom(min: number, max: number): number {
			return Math.floor(Math.random() * (max - min)) + min;
		}

		private getDelay(): number {
			return this.getRandom(1, 150);
		}

		public getAll(): ng.IPromise<IArticle[]> {
			var deferred = this.$q.defer();
			var promise = deferred.promise;
			
			this.$timeout((): void => {
				deferred.resolve(this.articles);	
			}, this.getDelay());

			return promise;
		}

		public getArticleStubs(): ng.IPromise<IArticleStub[]> {
			var deferred = this.$q.defer();
			var promise = deferred.promise;
			
			this.$timeout((): void => {
				var stubs: IArticleStub[] = [];
				for (var i = 0; i < this.articles.length; i++) {
					var article = this.articles[i];
					stubs.push({
						id: article.id,
						title: article.title,
						date: article.date,
					});
				}
				deferred.resolve(stubs);
			}, this.getDelay());

			return promise;
		}

		public getArticleById(id: number): ng.IPromise<IArticle> {
			var deferred = this.$q.defer();
			var promise = deferred.promise;
			var self = this;
			
			this.$timeout((): void => {
				var toResolve: IArticle = null;
				for (var i = 0; i < self.articles.length; i++) {
					if (self.articles[i].id === id) {
						toResolve = self.articles[i];
					}
				}
				deferred.resolve(toResolve);
			}, this.getDelay());

			return promise;
		}


	}

	app.Module.load('app.components.api').addService('NewsService', NewsService);
}

